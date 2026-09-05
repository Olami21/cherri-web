'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type HydrationEntry = { id: string; amount_ml: number; source_unit: string; logged_at: string };

const QUICK_UNITS = [
  { label: 'Cup', unit: 'cup', ml: 250 },
  { label: 'Pure water', unit: 'sachet', ml: 500 },
];

const BOTTLE_UNITS = [
  { label: '50cl', unit: 'bottle_50cl', ml: 500 },
  { label: '75cl', unit: 'bottle_75cl', ml: 750 },
  { label: '1L', unit: 'bottle_1l', ml: 1000 },
  { label: '1.5L', unit: 'bottle_1_5l', ml: 1500 },
];

function defaultTargetForGender(gender: string | null): number {
  if (gender === 'male') return 3000;
  if (gender === 'female') return 2200;
  return 2500;
}

export default function WaterPage() {
  const [entries, setEntries] = useState<HydrationEntry[]>([]);
  const [target, setTarget] = useState(2500);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setErrorMsg('You need to be logged in to track hydration.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, hydration_target_ml')
      .eq('user_id', user.id)
      .single();

    const resolvedTarget =
      profile?.hydration_target_ml ?? defaultTargetForGender(profile?.gender ?? null);
    setTarget(resolvedTarget);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: logs, error } = await supabase
      .from('hydration_logs')
      .select('id, amount_ml, source_unit, logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', startOfDay.toISOString())
      .lte('logged_at', endOfDay.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      setErrorMsg('Could not load your hydration log. Please try again.');
      setLoading(false);
      return;
    }

    setEntries((logs as HydrationEntry[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addEntry(amountMl: number, unit: string) {
    setAdding(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setErrorMsg('You need to be logged in to track hydration.');
      setAdding(false);
      return;
    }

    const { error } = await supabase.from('hydration_logs').insert({
      user_id: user.id,
      amount_ml: amountMl,
      source_unit: unit,
    });

    if (!error) {
      await load();
      setCustomAmount('');
    }
    setAdding(false);
  }

  async function deleteEntry(id: string) {
    await supabase.from('hydration_logs').delete().eq('id', id);
    load();
  }

  if (loading) {
    return (
      <main className="water-wrap">
        <p className="summary-hint">Loading your hydration...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="water-wrap">
        <p className="summary-error">{errorMsg}</p>
      </main>
    );
  }

  const totalMl = entries.reduce((sum, e) => sum + e.amount_ml, 0);
  const pct = Math.min(100, Math.round((totalMl / target) * 100));
  const remaining = Math.max(0, target - totalMl);

  return (
    <main className="water-wrap">
      <h1 className="section-title">Hydration</h1>

      <div className="water-progress">
        <div className="water-progress-top">
          <span>
            {(totalMl / 1000).toFixed(1)} L / {(target / 1000).toFixed(1)} L
          </span>
          <span>
            {remaining > 0
              ? `${(remaining / 1000).toFixed(1)} L remaining`
              : 'Target reached'}
          </span>
        </div>
        <div className="summary-bar-track water-bar-track">
          <div className="summary-bar-fill water-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="water-quick-row">
        {QUICK_UNITS.map((u) => (
          <button
            key={u.unit}
            type="button"
            className="water-quick-btn"
            disabled={adding}
            onClick={() => addEntry(u.ml, u.unit)}
          >
            + {u.label}
          </button>
        ))}
      </div>

      <p className="water-subheading">Bottle size</p>
      <div className="water-quick-row">
        {BOTTLE_UNITS.map((u) => (
          <button
            key={u.unit}
            type="button"
            className="water-quick-btn"
            disabled={adding}
            onClick={() => addEntry(u.ml, u.unit)}
          >
            + {u.label}
          </button>
        ))}
      </div>

      <p className="water-subheading">Custom amount (ml)</p>
      <div className="water-custom-row">
        <input
          type="number"
          min="1"
          placeholder="e.g. 300"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
        />
        <button
          type="button"
          className="water-quick-btn"
          disabled={adding || !customAmount}
          onClick={() => addEntry(Number(customAmount), 'custom')}
        >
          Add
        </button>
      </div>

      {entries.length > 0 && (
        <div className="water-log-list">
          <p className="water-subheading">Today&apos;s log</p>
          <ul>
            {entries.map((e) => (
              <li key={e.id}>
                <span>{e.amount_ml}ml</span>
                <span className="water-log-time">
                  {new Date(e.logged_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                <button type="button" onClick={() => deleteEntry(e.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}