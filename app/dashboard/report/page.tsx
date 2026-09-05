'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const FIBER_BASELINE_G = 25;
const CALORIE_TOLERANCE_PCT = 0.15;

function defaultTargetForGender(gender: string | null): number {
  if (gender === 'male') return 3000;
  if (gender === 'female') return 2200;
  return 2500;
}

type DayData = {
  key: string;
  label: string;
  calories: number;
  protein: number;
  fiber: number;
  waterMl: number;
  score: number;
};

export default function WeeklyReportPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [report, setReport] = useState<{
    adherencePct: number;
    daysWithinTarget: number;
    avgHydrationL: number;
    avgProteinG: number;
    bestDayLabel: string;
    improveArea: string;
    improveDaysBelow: number;
    nextWeekFocus: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view your weekly report.');
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
          'Complete your profile setup to unlock your weekly report.'
        );
        setLoading(false);
        return;
      }

      const hydrationTarget =
        profile.hydration_target_ml ?? defaultTargetForGender(profile.gender);

      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const { data: mealLogs } = await supabase
        .from('diet_logs')
        .select('meal_type, servings, logged_at, foods ( calories, protein_g, fiber_g )')
        .eq('user_id', user.id)
        .gte('logged_at', start.toISOString());

      const { data: waterLogs } = await supabase
        .from('hydration_logs')
        .select('amount_ml, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', start.toISOString());

      const days: DayData[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', { weekday: 'long' });
        days.push({ key, label, calories: 0, protein: 0, fiber: 0, waterMl: 0, score: 0 });
      }

      const dayMap = Object.fromEntries(days.map((d) => [d.key, d]));

      (mealLogs ?? []).forEach((log: any) => {
        const key = log.logged_at.slice(0, 10);
        const day = dayMap[key];
        if (!day) return;
        day.calories += (log.foods?.calories ?? 0) * log.servings;
        day.protein += (log.foods?.protein_g ?? 0) * log.servings;
        day.fiber += (log.foods?.fiber_g ?? 0) * log.servings;
      });

      (waterLogs ?? []).forEach((log: any) => {
        const key = log.logged_at.slice(0, 10);
        const day = dayMap[key];
        if (!day) return;
        day.waterMl += log.amount_ml;
      });

      let daysWithinTarget = 0;
      let totalProteinPct = 0;
      let totalFiberPct = 0;
      let totalHydrationPct = 0;
      let fiberBelowCount = 0;
      let hydrationBelowCount = 0;
      let proteinBelowCount = 0;

      days.forEach((day) => {
        const calorieDeviation =
          Math.abs(day.calories - profile.calorie_target) / profile.calorie_target;
        if (calorieDeviation <= CALORIE_TOLERANCE_PCT) daysWithinTarget++;

        const caloriePct = Math.max(0, 100 - calorieDeviation * 150);
        const proteinPct = profile.protein_target_g
          ? Math.min(100, (day.protein / profile.protein_target_g) * 100)
          : 0;
        const fiberPct = Math.min(100, (day.fiber / FIBER_BASELINE_G) * 100);
        const hydrationPct = Math.min(100, (day.waterMl / hydrationTarget) * 100);

        if (proteinPct < 90) proteinBelowCount++;
        if (fiberPct < 90) fiberBelowCount++;
        if (hydrationPct < 90) hydrationBelowCount++;

        totalProteinPct += proteinPct;
        totalFiberPct += fiberPct;
        totalHydrationPct += hydrationPct;

        day.score = Math.round(caloriePct * 0.4 + proteinPct * 0.3 + fiberPct * 0.3);
      });

      const adherencePct = Math.round((daysWithinTarget / 7) * 100);
      const avgProteinG = Math.round(
        days.reduce((sum, d) => sum + d.protein, 0) / 7
      );
      const avgHydrationL =
        Math.round((days.reduce((sum, d) => sum + d.waterMl, 0) / 7 / 1000) * 10) / 10;

      const bestDay = [...days].sort((a, b) => b.score - a.score)[0];

      const areas = [
        { name: 'Protein', belowCount: proteinBelowCount, avgPct: totalProteinPct / 7 },
        { name: 'Fiber', belowCount: fiberBelowCount, avgPct: totalFiberPct / 7 },
        { name: 'Hydration', belowCount: hydrationBelowCount, avgPct: totalHydrationPct / 7 },
      ];
      const weakest = areas.sort((a, b) => a.avgPct - b.avgPct)[0];

      const focusMessages: Record<string, string> = {
        Protein: 'Add one protein-rich food, eggs, beans, fish, or moin moin, to each main meal next week.',
        Fiber: 'Add one high-fiber food to your lunch or dinner each day next week.',
        Hydration: 'Try keeping a bottle nearby and logging water right after each meal next week.',
      };

      setReport({
        adherencePct,
        daysWithinTarget,
        avgHydrationL,
        avgProteinG,
        bestDayLabel: bestDay.label,
        improveArea: weakest.name,
        improveDaysBelow: weakest.belowCount,
        nextWeekFocus: focusMessages[weakest.name],
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="report-wrap">
        <p className="summary-hint">Building your weekly report...</p>
      </main>
    );
  }

  if (errorMsg || !report) {
    return (
      <main className="report-wrap">
        <p className="summary-hint">{errorMsg}</p>
      </main>
    );
  }

  return (
    <main className="report-wrap">
      <h1 className="section-title">Your week in nutrition</h1>

      <div className="report-adherence-card">
        <span className="insights-score-number">{report.adherencePct}%</span>
        <span className="insights-score-label">Goal adherence</span>
      </div>

      <div className="report-row">
        <h3>Calories</h3>
        <p>
          You stayed within your target on {report.daysWithinTarget} of 7
          days.
        </p>
      </div>

      <div className="report-row">
        <h3>Hydration</h3>
        <p>Average: {report.avgHydrationL} L/day</p>
      </div>

      <div className="report-row">
        <h3>Protein</h3>
        <p>Average: {report.avgProteinG} g/day</p>
      </div>

      <div className="report-row">
        <h3>Best day</h3>
        <p>{report.bestDayLabel}</p>
      </div>

      <div className="report-row">
        <h3>Area to improve</h3>
        <p>
          {report.improveArea} intake was below target on{' '}
          {report.improveDaysBelow} of 7 days.
        </p>
      </div>

      <div className="report-focus-card">
        <span>Next week&apos;s focus</span>
        <p>{report.nextWeekFocus}</p>
      </div>
    </main>
  );
}