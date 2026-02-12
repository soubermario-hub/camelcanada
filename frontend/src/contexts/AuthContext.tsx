import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  sessionReady: boolean;
  authError: string | null;
  recoverSession: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const recoverRef = useRef<Promise<boolean> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError(error.message);
      setSession(data.session ?? null);
      setSessionReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const recoverSession = async () => {
    if (recoverRef.current) return recoverRef.current;
    recoverRef.current = new Promise<boolean>((resolve) => {
      const delay = Math.min(1000 * 2 ** attemptsRef.current, 8000);
      setTimeout(async () => {
        const { data, error } = await supabase.auth.getSession();
        attemptsRef.current += 1;
        if (error?.message.includes('429')) {
          setAuthError('Auth is rate-limited; wait 30s then reload');
          resolve(false);
        } else if (data.session) {
          setSession(data.session);
          attemptsRef.current = 0;
          resolve(true);
        } else {
          resolve(false);
        }
        recoverRef.current = null;
      }, delay);
    });

    return recoverRef.current;
  };

  const value = useMemo(() => ({
    session,
    sessionReady,
    authError,
    recoverSession,
    signOut: async () => { await supabase.auth.signOut(); setSession(null); }
  }), [session, sessionReady, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
