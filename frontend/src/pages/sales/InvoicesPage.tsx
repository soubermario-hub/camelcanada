import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useCompany } from '../../contexts/CompanyContext';

export function InvoicesPage() {
  const { activeCompanyId } = useCompany();
  const qc = useQueryClient();
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('Service work');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(100);
  const [taxRate, setTaxRate] = useState(5);

  const clients = useQuery({ queryKey: ['clients', activeCompanyId], enabled: Boolean(activeCompanyId), staleTime: 60_000, queryFn: () => api.get(`/clients?company_id=${activeCompanyId}`) });
  const invoices = useQuery({ queryKey: ['invoices', activeCompanyId], enabled: Boolean(activeCompanyId), staleTime: 60_000, queryFn: () => api.get(`/invoices?company_id=${activeCompanyId}`) });


  const downloadInvoicePdf = async (invoice: { id: number; invoice_number: string }) => {
    const pdfBlob = await api.getBlob(`/invoices/${invoice.id}/pdf`);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const createInvoice = useMutation({
    mutationFn: () => api.post('/invoices', {
      company_id: activeCompanyId,
      client_id: Number(clientId),
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      currency: 'USD',
      items: [{ description, qty, unit_price: unitPrice, tax_rate: taxRate }]
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', activeCompanyId] })
  });

  if (!activeCompanyId) return <p>Select company to view invoices.</p>;

  return <div>
    <h2>Invoices</h2>
    <ul>{(invoices.data || []).map((invoice: any) => (
      <li key={invoice.id}>{invoice.invoice_number} - {invoice.total} <button type="button" onClick={() => downloadInvoicePdf(invoice)}>Download PDF</button></li>
    ))}</ul>

    <h3>Create Invoice</h3>
    <form onSubmit={(e) => { e.preventDefault(); createInvoice.mutate(); }}>
      <select required value={clientId} onChange={(e) => setClientId(e.target.value)}>
        <option value="">Select client</option>
        {(clients.data || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
      <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
      <button>Create Invoice</button>
    </form>
  </div>;
}
