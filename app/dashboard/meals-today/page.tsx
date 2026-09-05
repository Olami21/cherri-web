'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type LoggedMeal = {
  id: string;
  meal_type: string;
  servings: number;
  logged_at: string;
  foods: {
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    image_url: string | null;
  };
};

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealsTodayPage() {
  const [logs, setLogs] = useState<LoggedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setErrorMsg('You need to be logged in to view today\u2019s meals.');
        setLoading(false);
        return;
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('diet_logs')
        .select(
          'id, meal_type, servings, logged_at, foods ( name, calories, protein_g, carbs_g, fat_g, image_url )'
        )
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString())
        .order('logged_at', { ascending: true });

      if (error) {
        setErrorMsg('Could not load today\u2019s meals. Please try again.');
        setLoading(false);
        return;
      }

      setLogs((data as unknown as LoggedMeal[]) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  const totals = logs.reduce(
    (acc, log) => {
      acc.calories += log.foods.calories * log.servings;
      acc.protein += log.foods.protein_g * log.servings;
      acc.carbs += log.foods.carbs_g * log.servings;
      acc.fat += log.foods.fat_g * log.servings;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const grouped = MEAL_ORDER.map((type) => ({
    type,
    items: logs.filter((l) => l.meal_type === type),
  }));

  if (loading) {
    return (
      <main className="meals-today-wrap">
        <p className="meals-today-hint">Loading today&apos;s meals...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="meals-today-wrap">
        <p className="meals-today-error">{errorMsg}</p>
      </main>
    );
  }

  return (
    <main className="meals-today-wrap">
      <div className="meals-today-header">
        <h1 className="section-title">Today&apos;s meals</h1>
        <Link href="/dashboard/log-meal" className="meals-today-add-btn">
          + Log a meal
        </Link>
      </div>

      <div className="meals-today-totals">
        <div>
          <span>Calories</span>
          <strong>{Math.round(totals.calories)}</strong>
        </div>
        <div>
          <span>Protein</span>
          <strong>{Math.round(totals.protein)}g</strong>
        </div>
        <div>
          <span>Carbs</span>
          <strong>{Math.round(totals.carbs)}g</strong>
        </div>
        <div>
          <span>Fat</span>
          <strong>{Math.round(totals.fat)}g</strong>
        </div>
      </div>

      {logs.length === 0 && (
        <p className="meals-today-empty">
          No meals logged yet, let&apos;s start with breakfast.
        </p>
      )}

      {grouped.map(
        ({ type, items }) =>
          items.length > 0 && (
            <section key={type} className="meals-today-section">
              <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
              <ul className="meals-today-list">
                {items.map((log) => (
                  <li key={log.id} className="meals-today-item">
                    <span className="meals-today-item-name">
                      {log.foods.name}
                      <span className="meals-today-item-servings">
                        {log.servings}x serving
                      </span>
                    </span>
                    <span className="meals-today-item-cal">
                      {Math.round(log.foods.calories * log.servings)} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )
      )}
    </main>
  );
}