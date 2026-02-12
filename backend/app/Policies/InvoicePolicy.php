<?php

namespace App\Policies;

use App\Models\CompanyUser;
use App\Models\User;

class InvoicePolicy
{
    public function create(User $user, int $companyId): bool
    {
        return CompanyUser::where('company_id', $companyId)
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'admin', 'accountant'])
            ->exists();
    }
}
