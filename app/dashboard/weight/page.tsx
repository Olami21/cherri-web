'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type WeightEntry = { id: string; weight_kg: number; logged_at: string };

export default function WeightTrendPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your weight trend.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('weight_logs')
        .select('id, weight_kg, logged_at')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: true })
        .limit(30);

      if (error) {
        setErrorMsg('Could not load your weight history. Please try again.');
        setLoading(false);
        return;
      }

      setEntries((data as WeightEntry[]) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="log-weight-wrap">
        <p className="summary-hint">Loading your weight trend...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="log-weight-wrap">
        <p className="summary-error">{errorMsg}</p>
      </main>
    );
  }

  const hasEntries = entries.length > 0;
  const first = entries[0];
  const latest = entries[entries.length - 1];
  const change = hasEntries ? latest.weight_kg - first.weight_kg : 0;

  const weights = entries.map((e) => e.weight_kg);
  const minWeight = Math.min(...weights, latest?.weight_kg ?? 0);
  const maxWeight = Math.max(...weights, latest?.weight_kg ?? 0);
  const range = maxWeight - minWeight || 1;

  return (
    <main className="log-weight-wrap">
      <div className="meals-today-header">
        <h1 className="section-title">Weight trend</h1>
        <Link href="/dashboard/log-weight" className="meals-today-add-btn">
          + Log weight
        </Link>
      </div>

      {!hasEntries && (
        <p className="summary-hint">
          No weight logged yet, add your first entry to start tracking your
          trend.
        </p>
      )}

      {hasEntries && (
        <>
          <div className="log-weight-summary">
            <div>
              <span>Latest</span>
              <strong>{latest.weight_kg} kg</strong>
            </div>
            <div>
              <span>Since first log</span>
              <strong className={change <= 0 ? 'is-down' : 'is-up'}>
                {change > 0 ? '+' : ''}
                {change.toFixed(1)} kg
              </strong>
            </div>
          </div>

          <div className="history-chart log-weight-chart">
            {entries.map((entry) => {
              const heightPct = Math.max(
                8,
                Math.round(((entry.weight_kg - minWeight) / range) * 100)
              );
              const label = new Date(entry.logged_at).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' }
              );
              return (
                <div key={entry.id} className="history-bar-col">
                  <span className="history-bar-value">{entry.weight_kg}</span>
                  <div className="history-bar-track">
                    <div
                      className="history-bar-fill log-weight-bar-fill"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="history-bar-label">{label}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}