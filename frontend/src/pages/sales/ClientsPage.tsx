import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useCompany } from '../../contexts/CompanyContext';

type Client = { id: number; name: string; email?: string };

export function ClientsPage() {
  const { activeCompanyId } = useCompany();
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const clients = useQuery({
    queryKey: ['clients', activeCompanyId],
    enabled: Boolean(activeCompanyId),
    staleTime: 60_000,
    queryFn: () => api.get(`/clients?company_id=${activeCompanyId}`)
  });

  const createClient = useMutation({
    mutationFn: (payload: { name: string }) => api.post('/clients', { company_id: activeCompanyId, ...payload }),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ['clients', activeCompanyId] });
      const previous = qc.getQueryData<Client[]>(['clients', activeCompanyId]) || [];
      qc.setQueryData(['clients', activeCompanyId], [{ id: Date.now(), name: payload.name }, ...previous]);
      return { previous };
    },
    onError: (_err, _payload, context) => {
      qc.setQueryData(['clients', activeCompanyId], context?.previous || []);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['clients', activeCompanyId] })
  });

  if (!activeCompanyId) return <p>Select company to view clients.</p>;

  return <div>
    <h2>Clients</h2>
    {clients.isLoading ? <p>Loading...</p> : <ul>{(clients.data || []).map((c: Client) => <li key={c.id}>{c.name}</li>)}</ul>}
    <form onSubmit={(e) => { e.preventDefault(); createClient.mutate({ name }); setName(''); }}>
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
      <button type="submit">Add Client</button>
    </form>
  </div>;
}
