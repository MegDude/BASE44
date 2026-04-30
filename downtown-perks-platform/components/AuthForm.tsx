'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export function AuthForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [nextPath, setNextPath] = useState('');
  const [callbackError, setCallbackError] = useState('');
  const supabase = useMemo(() => getBrowserSupabase(), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    const error = params.get('error');
    if (next && next.startsWith('/')) setNextPath(next);
    if (error) setCallbackError(error);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus('Missing Supabase public env vars.');
      return;
    }
    const redirectTo = new URL('/auth/callback', window.location.origin);
    if (nextPath) redirectTo.searchParams.set('next', nextPath);
    const { error } =
      mode === 'signup'
        ? await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo.toString(), data: { role: 'member' } }
          })
        : await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo.toString() }
          });

    setStatus(error ? error.message : 'Check your email for the sign-in link.');
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'grid', gap:12}}>
      <input
        aria-label="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        placeholder="Email address"
        className="input"
        type="email"
        required
      />
      <button className="btn" type="submit">{mode === 'signup' ? 'Create account' : 'Send magic link'}</button>
      {status ? <p className="copy">{status}</p> : null}
      {!status && callbackError ? <p className="copy">Authentication could not be completed. Check Supabase settings and try again.</p> : null}
    </form>
  );
}
