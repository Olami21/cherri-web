'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.from('subscribers').insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      source: 'homepage',
    });

    if (error) {
      setStatus('error');
      setErrorMsg(
        error.code === '23505'
          ? "You're already on the list."
          : 'Something went wrong. Please try again.'
      );
      return;
    }

    setStatus('success');
    setFullName('');
    setEmail('');
  }

  if (status === 'success') {
    return (
      <div className="signup-form signup-success">
        <p>You&apos;re on the list. We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="hello@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {status === 'error' && (
        <p className="signup-error" role="alert">
          {errorMsg}
        </p>
      )}

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Joining...' : 'Join early access'}
      </button>
    </form>
  );
}