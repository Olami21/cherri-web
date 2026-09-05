'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const FIBER_BASELINE_G = 25;

function defaultTargetForGender(gender: string | null): number {
  if (gender === 'male') return 3000;
  if (gender === 'female') return 2200;
  return 2500;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [focusMessage, setFocusMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your insights.');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, calorie_target, protein_target_g, hydration_target_ml')
        .eq('user_id', user.id)
        .single();

      if (!profile || !profile.calorie_target) {
        setErrorMsg(
          'Complete your profile setup to unlock your daily nutrition score.'
        );
        setLoading(false);
        return;
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: mealLogs } = await supabase
        .from('diet_logs')
        .select('meal_type, servings, foods ( calories, protein_g, fiber_g )')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString());

      const { data: waterLogs } = await supabase
        .from('hydration_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString());

      const totals = (mealLogs ?? []).reduce(
        (acc: any, log: any) => {
          acc.calories += (log.foods?.calories ?? 0) * log.servings;
          acc.protein += (log.foods?.protein_g ?? 0) * log.servings;
          acc.fiber += (log.foods?.fiber_g ?? 0) * log.servings;
          return acc;
        },
        { calories: 0, protein: 0, fiber: 0 }
      );

      const loggedMealTypes = new Set(
        (mealLogs ?? []).map((l: any) => l.meal_type)
      );
      const mealConsistencyPct =
        (['breakfast', 'lunch', 'dinner'].filter((m) =>
          loggedMealTypes.has(m)
        ).length /
          3) *
        100;

      const totalWaterMl = (waterLogs ?? []).reduce(
        (sum: number, w: any) => sum + w.amount_ml,
        0
      );
      const hydrationTarget =
        profile.hydration_target_ml ?? defaultTargetForGender(profile.gender);

      // Calorie balance: 100 at target, penalized in both directions
      const calorieDeviationPct =
        Math.abs(totals.calories - profile.calorie_target) /
        profile.calorie_target;
      const caloriePct = Math.max(0, 100 - calorieDeviationPct * 150);

      const proteinPct = profile.protein_target_g
        ? Math.min(100, (totals.protein / profile.protein_target_g) * 100)
        : 0;

      const fiberPct = Math.min(100, (totals.fiber / FIBER_BASELINE_G) * 100);

      const hydrationPct = Math.min(
        100,
        (totalWaterMl / hydrationTarget) * 100
      );

      const weighted =
        caloriePct * 0.3 +
        proteinPct * 0.2 +
        fiberPct * 0.15 +
        hydrationPct * 0.2 +
        mealConsistencyPct * 0.15;

      const components = {
        'Calorie balance': caloriePct,
        Protein: proteinPct,
        Fiber: fiberPct,
        Hydration: hydrationPct,
        'Meal consistency': mealConsistencyPct,
      };

      setBreakdown(components);
      setScore(Math.round(weighted));

      const weakest = Object.entries(components).sort((a, b) => a[1] - b[1])[0];
      setFocusMessage(getFocusMessage(weakest[0]));

      setLoading(false);
    }

    load();
  }, []);

  function getFocusMessage(component: string): string {
    switch (component) {
      case 'Calorie balance':
        return 'Try to keep today\u2019s meals closer to your daily calorie target.';
      case 'Protein':
        return 'Your protein intake is a bit low today, consider adding eggs, beans, fish, or moin moin to your next meal.';
      case 'Fiber':
        return 'Your fiber intake is below where it could be, adding vegetables, beans, or fruit can help.';
      case 'Hydration':
        return 'You\u2019re behind on water today, a glass now goes a long way.';
      case 'Meal consistency':
        return 'You haven\u2019t logged all your main meals yet today, keeping it consistent helps your insights stay accurate.';
      default:
        return 'Keep going, you\u2019re on track today.';
    }
  }

  if (loading) {
    return (
      <main className="insights-wrap">
        <p className="summary-hint">Loading your insights...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="insights-wrap">
        <p className="summary-hint">{errorMsg}</p>
      </main>
    );
  }

  return (
    <main className="insights-wrap">
      <h1 className="section-title">Today&apos;s insight</h1>

      <div className="insights-score-card">
        <span className="insights-score-label">Nutrition score</span>
        <div className="insights-score-number">{score}</div>
        <span className="insights-score-out-of">out of 100</span>
      </div>

      <p className="insights-focus">{focusMessage}</p>

      <div className="insights-breakdown">
        {Object.entries(breakdown).map(([label, value]) => (
          <div key={label} className="insights-breakdown-row">
            <div className="summary-row-top">
              <span>{label}</span>
              <span>{Math.round(value)}%</span>
            </div>
            <div className="summary-bar-track">
              <div
                className="summary-bar-fill"
                style={{ width: `${Math.round(value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}