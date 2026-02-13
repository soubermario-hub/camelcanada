import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { bindAuthActions } from '../lib/api';
import { SignInPage } from '../pages/auth/SignInPage';
import { Layout } from '../components/Layout';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ClientsPage } from '../pages/sales/ClientsPage';
import { InvoicesPage } from '../pages/sales/InvoicesPage';
import { ComingSoonPage } from '../pages/placeholders/ComingSoonPage';

export function AppRouter() {
  const auth = useAuth();

  useEffect(() => {
    bindAuthActions({ recoverSession: auth.recoverSession, signOut: auth.signOut });
  }, [auth.recoverSession, auth.signOut]);

  if (!auth.sessionReady) return <p>Loading auth…</p>;
  if (auth.authError) return <p>{auth.authError}</p>;
  if (!auth.session) return <SignInPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<Navigate to="/sales/clients" replace />} />
        <Route path="/sales/clients" element={<ClientsPage />} />
        <Route path="/sales/invoices" element={<InvoicesPage />} />
        <Route path="/banking" element={<ComingSoonPage />} />
        <Route path="/expenses" element={<ComingSoonPage />} />
        <Route path="/payroll" element={<ComingSoonPage />} />
        <Route path="/reports" element={<ComingSoonPage />} />
        <Route path="/taxes" element={<ComingSoonPage />} />
        <Route path="/accounting" element={<ComingSoonPage />} />
        <Route path="/settings" element={<ComingSoonPage />} />
        <Route path="/coming-soon/:slug" element={<ComingSoonPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
