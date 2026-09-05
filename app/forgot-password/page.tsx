'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg('Something went wrong. Please try again.');
      return;
    }

    setSent(true);
  }

  return (
    <main className="auth-wrap">
      <h1 className="section-title">Reset your password</h1>

      {sent ? (
        <p className="profile-message">
          If an account exists for {email}, a password reset link has
          been sent. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="log-meal-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="log-meal-error">{error}</p>}

          <button type="submit" className="log-meal-save-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
    </main>
  );
}