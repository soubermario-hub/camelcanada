<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companies = Company::query()
            ->select('companies.*', 'company_users.role')
            ->join('company_users', 'companies.id', '=', 'company_users.company_id')
            ->where('company_users.user_id', $request->user()->id)
            ->get();

        return response()->json($companies);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);

        $company = DB::transaction(function () use ($request, $data) {
            $company = Company::create(['name' => $data['name'], 'created_by' => $request->user()->id]);
            CompanyUser::create([
                'company_id' => $company->id,
                'user_id' => $request->user()->id,
                'role' => 'owner',
                'status' => 'active',
            ]);
            return $company;
        });

        return response()->json($company, 201);
    }
}
