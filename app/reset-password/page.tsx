'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMsg('Something went wrong. Please try requesting a new reset link.');
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  }

  if (success) {
    return (
      <main className="auth-wrap">
        <h1 className="section-title">Password updated</h1>
        <p className="profile-message">Redirecting you to login...</p>
      </main>
    );
  }

  return (
    <main className="auth-wrap">
      <h1 className="section-title">Set a new password</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="log-meal-field">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="log-meal-field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="log-meal-error">{error}</p>}

        <button type="submit" className="log-meal-save-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </main>
  );
}