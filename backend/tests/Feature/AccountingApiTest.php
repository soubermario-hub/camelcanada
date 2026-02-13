<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_is_required(): void
    {
        $this->getJson('/api/companies')->assertStatus(401);
    }


    public function test_non_member_cannot_list_clients_or_invoices(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/clients?company_id=' . $company->id)
            ->assertForbidden();

        $this->actingAs($user)
            ->getJson('/api/invoices?company_id=' . $company->id)
            ->assertForbidden();
    }

    public function test_member_cannot_create_client_or_invoice(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        CompanyUser::factory()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'member']);

        $this->actingAs($user)
            ->postJson('/api/clients', ['company_id' => $company->id, 'name' => 'Denied'])
            ->assertStatus(403);
    }

    public function test_client_persists_after_creation(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        CompanyUser::factory()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner']);

        $this->actingAs($user)
            ->postJson('/api/clients', ['company_id' => $company->id, 'name' => 'Acme'])
            ->assertCreated();

        $this->assertDatabaseHas('clients', ['company_id' => $company->id, 'name' => 'Acme']);
    }


    public function test_non_member_cannot_download_invoice_pdf(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $company = Company::factory()->create();
        CompanyUser::factory()->create(['company_id' => $company->id, 'user_id' => $owner->id, 'role' => 'owner']);
        $client = Client::factory()->create(['company_id' => $company->id]);
        $invoice = Invoice::factory()->create(['company_id' => $company->id, 'client_id' => $client->id]);

        $this->actingAs($intruder)
            ->get('/api/invoices/' . $invoice->id . '/pdf')
            ->assertForbidden();
    }

    public function test_invoice_persists_and_pdf_works(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create();
        CompanyUser::factory()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner']);
        $client = Client::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($user)->postJson('/api/invoices', [
            'company_id' => $company->id,
            'client_id' => $client->id,
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addWeek()->toDateString(),
            'currency' => 'USD',
            'items' => [['description' => 'Work', 'qty' => 1, 'unit_price' => 100, 'tax_rate' => 5]],
        ])->assertCreated();

        $invoice = Invoice::findOrFail($response->json('id'));
        $this->assertDatabaseHas('invoices', ['id' => $invoice->id]);

        $this->actingAs($user)
            ->get('/api/invoices/' . $invoice->id . '/pdf')
            ->assertOk();
    }
}
