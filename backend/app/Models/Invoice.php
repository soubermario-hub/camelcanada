<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'client_id', 'invoice_number', 'issue_date', 'due_date', 'status',
        'subtotal', 'tax_total', 'total', 'currency', 'created_by',
    ];

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
