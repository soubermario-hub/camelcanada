<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\CompanyUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['company_id' => ['required', 'integer', 'exists:companies,id']]);
        $isMember = CompanyUser::where('company_id', $data['company_id'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->exists();

        abort_unless($isMember, 403);

        return response()->json(Client::where('company_id', $data['company_id'])->latest()->get());
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        Gate::authorize('clients.create', (int) $request->integer('company_id'));

        $client = Client::create(array_merge($request->validated(), ['created_by' => $request->user()->id]));

        AuditLog::create([
            'company_id' => $client->company_id,
            'user_id' => $request->user()->id,
            'action' => 'client.created',
            'entity_type' => Client::class,
            'entity_id' => $client->id,
            'payload_json' => $client->toArray(),
        ]);

        return response()->json($client, 201);
    }
}
