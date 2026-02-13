<!doctype html>
<html>
<head><meta charset="utf-8"><title>{{ $invoice->invoice_number }}</title></head>
<body>
<h1>Invoice {{ $invoice->invoice_number }}</h1>
<p>Total: {{ $invoice->currency }} {{ number_format($invoice->total, 2) }}</p>
<table width="100%" border="1" cellspacing="0" cellpadding="4">
<thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
<tbody>
@foreach($invoice->items as $item)
<tr>
<td>{{ $item->description }}</td><td>{{ $item->qty }}</td><td>{{ $item->unit_price }}</td><td>{{ $item->line_total }}</td>
</tr>
@endforeach
</tbody>
</table>
</body>
</html>
