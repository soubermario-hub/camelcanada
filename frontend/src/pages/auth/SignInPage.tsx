import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }}>
      <h1>Sign In</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Sign in</button>
      {error && <p>{error}</p>}
    </form>
  );
}
