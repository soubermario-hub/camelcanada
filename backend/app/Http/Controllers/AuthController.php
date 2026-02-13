<?php

namespace App\Http\Controllers;

use App\Models\CompanyUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function bootstrap(Request $request): JsonResponse
    {
        $memberships = CompanyUser::with('company')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'companies' => $memberships->map(fn ($m) => [
                'id' => $m->company->id,
                'name' => $m->company->name,
                'role' => $m->role,
            ]),
            'defaultCompanyId' => $memberships->first()?->company_id,
        ]);
    }
}
