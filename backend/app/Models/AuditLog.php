<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'user_id', 'action', 'entity_type', 'entity_id', 'payload_json'];

    protected $casts = ['payload_json' => 'array'];
}
