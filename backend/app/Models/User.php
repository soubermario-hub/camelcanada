<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory;
    use HasUuids;
    use Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'email'];

    public function companyMemberships()
    {
        return $this->hasMany(CompanyUser::class);
    }
}
