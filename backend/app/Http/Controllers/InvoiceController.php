<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['company_id' => ['required', 'integer', 'exists:companies,id']]);
        return response()->json(Invoice::with('items')->where('company_id', $data['company_id'])->latest()->get());
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        Gate::authorize('invoices.create', (int) $request->integer('company_id'));

        $invoice = DB::transaction(function () use ($request) {
            $companyId = (int) $request->integer('company_id');
            $last = Invoice::where('company_id', $companyId)->lockForUpdate()->max('id');
            $count = Invoice::where('company_id', $companyId)->where('id', '<=', $last)->count() + 1;
            $invoiceNumber = 'INV-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            $taxTotal = 0;
            foreach ($request->input('items') as $item) {
                $lineBase = $item['qty'] * $item['unit_price'];
                $lineTax = $lineBase * ($item['tax_rate'] / 100);
                $subtotal += $lineBase;
                $taxTotal += $lineTax;
            }

            $invoice = Invoice::create([
                'company_id' => $companyId,
                'client_id' => $request->integer('client_id'),
                'invoice_number' => $invoiceNumber,
                'issue_date' => $request->string('issue_date'),
                'due_date' => $request->string('due_date'),
                'status' => 'draft',
                'subtotal' => $subtotal,
                'tax_total' => $taxTotal,
                'total' => $subtotal + $taxTotal,
                'currency' => strtoupper($request->string('currency')->toString()),
                'created_by' => $request->user()->id,
            ]);

            foreach ($request->input('items') as $item) {
                $lineBase = $item['qty'] * $item['unit_price'];
                $lineTax = $lineBase * ($item['tax_rate'] / 100);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'qty' => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $item['tax_rate'],
                    'line_total' => $lineBase + $lineTax,
                ]);
            }

            return $invoice->load('items');
        });

        AuditLog::create([
            'company_id' => $invoice->company_id,
            'user_id' => $request->user()->id,
            'action' => 'invoice.created',
            'entity_type' => Invoice::class,
            'entity_id' => $invoice->id,
            'payload_json' => $invoice->toArray(),
        ]);

        return response()->json($invoice, 201);
    }

    public function pdf(Invoice $invoice)
    {
        $invoice->load('items');
        $pdf = Pdf::loadView('invoice-pdf', ['invoice' => $invoice]);
        return $pdf->download("{$invoice->invoice_number}.pdf");
    }
}
