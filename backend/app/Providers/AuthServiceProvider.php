<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Invoice;
use App\Policies\ClientPolicy;
use App\Policies\InvoicePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Client::class => ClientPolicy::class,
        Invoice::class => InvoicePolicy::class,
    ];

    public function boot(): void
    {
        Gate::define('clients.create', [ClientPolicy::class, 'create']);
        Gate::define('invoices.create', [InvoicePolicy::class, 'create']);
    }
}
