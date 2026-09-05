'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Totals = { calories: number; protein: number; carbs: number; fat: number };
type Targets = {
  calorie_target: number | null;
  protein_target_g: number | null;
  carbs_target_g: number | null;
  fat_target_g: number | null;
};

export default function SummaryPage() {
  const [totals, setTotals] = useState<Totals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [targets, setTargets] = useState<Targets | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your nutrition summary.');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('calorie_target, protein_target_g, carbs_target_g, fat_target_g')
        .eq('user_id', user.id)
        .single();

      if (!profileError && profile) setTargets(profile as Targets);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: logs, error: logsError } = await supabase
        .from('diet_logs')
        .select('servings, foods ( calories, protein_g, carbs_g, fat_g )')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString());

      if (logsError) {
        setErrorMsg('Could not load your summary. Please try again.');
        setLoading(false);
        return;
      }

      const computed = (logs ?? []).reduce(
        (acc: Totals, log: any) => {
          acc.calories += log.foods.calories * log.servings;
          acc.protein += log.foods.protein_g * log.servings;
          acc.carbs += log.foods.carbs_g * log.servings;
          acc.fat += log.foods.fat_g * log.servings;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setTotals(computed);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="summary-wrap">
        <p className="summary-hint">Loading your summary...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="summary-wrap">
        <p className="summary-error">{errorMsg}</p>
      </main>
    );
  }

  const hasTargets = targets && targets.calorie_target;

  const rows = hasTargets
    ? [
        { label: 'Calories', value: totals.calories, target: targets!.calorie_target!, unit: 'kcal' },
        { label: 'Protein', value: totals.protein, target: targets!.protein_target_g!, unit: 'g' },
        { label: 'Carbs', value: totals.carbs, target: targets!.carbs_target_g!, unit: 'g' },
        { label: 'Fat', value: totals.fat, target: targets!.fat_target_g!, unit: 'g' },
      ]
    : [];

  return (
    <main className="summary-wrap">
      <h1 className="section-title">Today&apos;s summary</h1>

      {!hasTargets && (
        <p className="summary-hint">
          Complete your profile setup to see progress against your daily
          targets.
        </p>
      )}

      {hasTargets && (
        <div className="summary-bars">
          {rows.map((row) => {
            const pct = Math.min(100, Math.round((row.value / row.target) * 100));
            return (
              <div key={row.label} className="summary-row">
                <div className="summary-row-top">
                  <span>{row.label}</span>
                  <span>
                    {Math.round(row.value)} / {Math.round(row.target)} {row.unit}
                  </span>
                </div>
                <div className="summary-bar-track">
                  <div
                    className="summary-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}