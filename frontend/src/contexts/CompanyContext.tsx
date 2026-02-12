import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

export type Company = { id: number; name: string; role: string };

const CompanyContext = createContext<{
  companies: Company[];
  activeCompanyId: number | null;
  setActiveCompanyId: (id: number) => void;
  loading: boolean;
}>({ companies: [], activeCompanyId: null, setActiveCompanyId: () => {}, loading: true });

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { sessionReady, session } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionReady || !session) return;
    api.post('/auth/bootstrap', {}).then((res) => {
      setCompanies(res.companies);
      const stored = Number(localStorage.getItem('activeCompanyId')) || res.defaultCompanyId;
      setActiveId(stored ?? null);
      setLoading(false);
    });
  }, [sessionReady, session]);

  const value = useMemo(() => ({
    companies,
    activeCompanyId,
    loading,
    setActiveCompanyId: (id: number) => {
      localStorage.setItem('activeCompanyId', String(id));
      setActiveId(id);
    }
  }), [companies, activeCompanyId, loading]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  return useContext(CompanyContext);
}
