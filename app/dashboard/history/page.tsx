'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DayTotal = { date: string; label: string; calories: number };

export default function HistoryPage() {
  const [days, setDays] = useState<DayTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your history.');
        setLoading(false);
        return;
      }

      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const { data: logs, error } = await supabase
        .from('diet_logs')
        .select('servings, logged_at, foods ( calories )')
        .eq('user_id', user.id)
        .gte('logged_at', start.toISOString())
        .order('logged_at', { ascending: true });

      if (error) {
        setErrorMsg('Could not load your history. Please try again.');
        setLoading(false);
        return;
      }

      const buckets: Record<string, number> = {};
      const labels: Record<string, string> = {};

      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        buckets[key] = 0;
        labels[key] = d.toLocaleDateString('en-US', { weekday: 'short' });
      }

      (logs ?? []).forEach((log: any) => {
        const key = log.logged_at.slice(0, 10);
        if (buckets[key] !== undefined) {
          buckets[key] += log.foods.calories * log.servings;
        }
      });

      const result = Object.keys(buckets).map((key) => ({
        date: key,
        label: labels[key],
        calories: Math.round(buckets[key]),
      }));

      setDays(result);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="history-wrap">
        <p className="summary-hint">Loading your history...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="history-wrap">
        <p className="summary-error">{errorMsg}</p>
      </main>
    );
  }

  const maxCalories = Math.max(...days.map((d) => d.calories), 1);
  const hasAnyData = days.some((d) => d.calories > 0);

  return (
    <main className="history-wrap">
      <h1 className="section-title">Last 7 days</h1>

      {!hasAnyData && (
        <p className="summary-hint">
          No meals logged yet this week, start logging to see your trend
          here.
        </p>
      )}

      {hasAnyData && (
        <div className="history-chart">
          {days.map((day) => {
            const heightPct = Math.max(4, Math.round((day.calories / maxCalories) * 100));
            return (
              <div key={day.date} className="history-bar-col">
                <span className="history-bar-value">
                  {day.calories > 0 ? day.calories : ''}
                </span>
                <div className="history-bar-track">
                  <div
                    className="history-bar-fill"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="history-bar-label">{day.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}