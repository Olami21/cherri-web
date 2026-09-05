// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FIBER_BASELINE_G = 25;

function defaultTargetForGender(gender: string | null): number {
  if (gender === 'male') return 3000;
  if (gender === 'female') return 2200;
  return 2500;
}

function getGreeting(hour: number): { line1: string; line2: string } {
  if (hour >= 5 && hour < 12) {
    return { line1: 'Good morning', line2: 'How\u2019s it going? What would you like to do today?' };
  }
  if (hour >= 12 && hour < 17) {
    return { line1: 'Good afternoon', line2: 'Here\u2019s how you\u2019re doing so far.' };
  }
  if (hour >= 17 && hour < 21) {
    return { line1: 'Good evening', line2: 'Let\u2019s see how your day is going.' };
  }
  return { line1: 'Good evening', line2: 'You\u2019ve almost completed your day. Let\u2019s review your progress.' };
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function DashboardHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState(getGreeting(new Date().getHours()));

  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [macroTargets, setMacroTargets] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [loggedMealTypes, setLoggedMealTypes] = useState<Set<string>>(new Set());

  const [waterMl, setWaterMl] = useState(0);
  const [waterTarget, setWaterTarget] = useState(2500);

  const [latestWeight, setLatestWeight] = useState<number | null>(null);

  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your dashboard.');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select(
          'full_name, gender, calorie_target, protein_target_g, carbs_target_g, fat_target_g, hydration_target_ml'
        )
        .eq('user_id', user.id)
        .single();

      setName(profile?.full_name?.split(' ')[0] ?? 'there');
      setCalorieTarget(profile?.calorie_target ?? null);
      setMacroTargets({
        protein: profile?.protein_target_g ?? 0,
        carbs: profile?.carbs_target_g ?? 0,
        fat: profile?.fat_target_g ?? 0,
      });
      setWaterTarget(
        profile?.hydration_target_ml ?? defaultTargetForGender(profile?.gender ?? null)
      );

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [mealsRes, waterRes, weightRes] = await Promise.all([
        supabase
          .from('diet_logs')
          .select('meal_type, servings, foods ( calories, protein_g, carbs_g, fat_g, fiber_g )')
          .eq('user_id', user.id)
          .gte('logged_at', startOfDay.toISOString())
          .lte('logged_at', endOfDay.toISOString()),
        supabase
          .from('hydration_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .gte('logged_at', startOfDay.toISOString())
          .lte('logged_at', endOfDay.toISOString()),
        supabase
          .from('weight_logs')
          .select('weight_kg, logged_at')
          .eq('user_id', user.id)
          .order('logged_at', { ascending: false })
          .limit(1),
      ]);

      const mealLogs = mealsRes.data ?? [];
      const computedTotals = mealLogs.reduce(
        (acc: any, log: any) => {
          acc.calories += (log.foods?.calories ?? 0) * log.servings;
          acc.protein += (log.foods?.protein_g ?? 0) * log.servings;
          acc.carbs += (log.foods?.carbs_g ?? 0) * log.servings;
          acc.fat += (log.foods?.fat_g ?? 0) * log.servings;
          acc.fiber += (log.foods?.fiber_g ?? 0) * log.servings;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );
      setTotals(computedTotals);
      setLoggedMealTypes(new Set(mealLogs.map((l: any) => l.meal_type)));

      const totalWaterMl = (waterRes.data ?? []).reduce(
        (sum: number, w: any) => sum + w.amount_ml,
        0
      );
      setWaterMl(totalWaterMl);

      if (weightRes.data && weightRes.data.length > 0) {
        setLatestWeight(weightRes.data[0].weight_kg);
      }

      if (profile?.calorie_target) {
        const calorieDeviationPct =
          Math.abs(computedTotals.calories - profile.calorie_target) / profile.calorie_target;
        const caloriePct = Math.max(0, 100 - calorieDeviationPct * 150);
        const proteinPct = profile.protein_target_g
          ? Math.min(100, (computedTotals.protein / profile.protein_target_g) * 100)
          : 0;
        const fiberPct = Math.min(100, (computedTotals.fiber / FIBER_BASELINE_G) * 100);
        const hydrationTargetForScore =
          profile.hydration_target_ml ?? defaultTargetForGender(profile.gender);
        const hydrationPct = Math.min(100, (totalWaterMl / hydrationTargetForScore) * 100);
        const mealConsistencyPct =
          (['breakfast', 'lunch', 'dinner'].filter((m) =>
            new Set(mealLogs.map((l: any) => l.meal_type)).has(m)
          ).length /
            3) *
          100;

        const weighted =
          caloriePct * 0.3 + proteinPct * 0.2 + fiberPct * 0.15 + hydrationPct * 0.2 + mealConsistencyPct * 0.15;
        setScore(Math.round(weighted));
      }

      setGreeting(getGreeting(new Date().getHours()));
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <main className="dash-home-wrap">
        <p className="summary-hint">Loading your dashboard...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="dash-home-wrap">
        <p className="summary-error">{errorMsg}</p>
      </main>
    );
  }

  const caloriesRemaining = calorieTarget !== null ? calorieTarget - totals.calories : null;

  return (
    <main className="dash-home-wrap">
      <div className="dash-home-header">
        <div>
          <h1 className="section-title">{greeting.line1}, {name}</h1>
          <p className="dash-home-subgreeting">{greeting.line2}</p>
        </div>
        <button type="button" className="dash-home-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="dash-quick-actions">
        <Link href="/dashboard/log-meal" className="dash-quick-btn">Log meal</Link>
        <Link href="/dashboard/log-weight" className="dash-quick-btn">Log weight</Link>
        <Link href="/dashboard/water" className="dash-quick-btn">Track water</Link>
        <Link href="/dashboard/summary" className="dash-quick-btn">View summary</Link>
      </div>

      {/* TODAY'S NUTRITION */}
      <section className="dash-card">
        <h2>Today&apos;s nutrition</h2>
        {calorieTarget !== null ? (
          <>
            <p className="dash-calorie-line">
              {Math.round(totals.calories)} / {Math.round(calorieTarget)} kcal
            </p>
            <p className="dash-calorie-sub">
              {caloriesRemaining !== null && caloriesRemaining >= 0
                ? `${Math.round(caloriesRemaining)} kcal remaining`
                : `Exceeded by ${Math.round(Math.abs(caloriesRemaining ?? 0))} kcal, one day doesn\u2019t define your progress`}
            </p>
            <div className="dash-macros">
              <div>
                <span>Protein</span>
                <div className="summary-bar-track">
                  <div
                    className="summary-bar-fill"
                    style={{ width: `${Math.min(100, (totals.protein / (macroTargets.protein || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <span>Carbs</span>
                <div className="summary-bar-track">
                  <div
                    className="summary-bar-fill"
                    style={{ width: `${Math.min(100, (totals.carbs / (macroTargets.carbs || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <span>Fat</span>
                <div className="summary-bar-track">
                  <div
                    className="summary-bar-fill"
                    style={{ width: `${Math.min(100, (totals.fat / (macroTargets.fat || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="dash-empty">Complete your profile setup to see targets here.</p>
        )}
      </section>

      <div className="dash-row-cards">
        {/* HYDRATION */}
        <section className="dash-card dash-card-half">
          <h2>Hydration</h2>
          <p className="dash-calorie-line">
            {(waterMl / 1000).toFixed(1)} / {(waterTarget / 1000).toFixed(1)} L
          </p>
          <div className="summary-bar-track">
            <div
              className="summary-bar-fill"
              style={{ width: `${Math.min(100, (waterMl / waterTarget) * 100)}%` }}
            />
          </div>
          <Link href="/dashboard/water" className="dash-card-link">Log water →</Link>
        </section>

        {/* NUTRITION SCORE */}
        <section className="dash-card dash-card-half dash-score-card">
          <h2>Nutrition score</h2>
          <div className="dash-score-number">{score ?? '—'}</div>
          <Link href="/dashboard/insights" className="dash-card-link">View insight →</Link>
        </section>
      </div>

      {/* TODAY'S MEALS */}
      <section className="dash-card">
        <h2>Today&apos;s meals</h2>
        <ul className="dash-meals-list">
          {MEAL_TYPES.map((type) => (
            <li key={type}>
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <span>{loggedMealTypes.has(type) ? '✓' : '—'}</span>
            </li>
          ))}
        </ul>
        <Link href="/dashboard/log-meal" className="dash-card-link">+ Log a meal</Link>
      </section>

      {/* WEIGHT + WEEKLY REPORT */}
      <div className="dash-row-cards">
        <section className="dash-card dash-card-half">
          <h2>Weight</h2>
          <p className="dash-calorie-line">
            {latestWeight !== null ? `${latestWeight} kg` : 'No entries yet'}
          </p>
          <Link href="/dashboard/weight" className="dash-card-link">View trend →</Link>
        </section>

        <section className="dash-card dash-card-half">
          <h2>Weekly report</h2>
          <p className="dash-empty">See your week at a glance.</p>
          <Link href="/dashboard/report" className="dash-card-link">Open report →</Link>
        </section>
      </div>
    </main>
  );
}