<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CompanyUserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => 1,
            'user_id' => (string) Str::uuid(),
            'role' => 'member',
            'status' => 'active',
        ];
    }
}
