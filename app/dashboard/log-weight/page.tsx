'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LogWeightPage() {
  const router = useRouter();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setErrorMsg] = useState('');

  async function handleSave() {
    const weightNum = parseFloat(weight);

    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setErrorMsg('Please enter a valid weight.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setErrorMsg('You need to be logged in to log your weight.');
      setSaving(false);
      return;
    }

    const loggedAt = new Date(`${date}T12:00:00`).toISOString();

    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight_kg: weightNum,
      logged_at: loggedAt,
    });

    if (error) {
      setErrorMsg('Something went wrong saving this entry. Please try again.');
      setSaving(false);
      return;
    }

    router.push('/dashboard/weight');
  }

  return (
    <main className="log-weight-wrap">
      <h1 className="section-title">Log your weight</h1>

      <div className="log-meal-field">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="log-meal-field log-weight-input-field">
        <label htmlFor="weight">Weight (kg)</label>
        <input
          id="weight"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g. 68.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      {error && (
        <p className="log-meal-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="log-meal-save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save weight'}
      </button>
    </main>
  );
}