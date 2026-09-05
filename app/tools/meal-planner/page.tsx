'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateDayPlan, PlannerFood, DayPlan } from '@/lib/mealPlanner';

const GOAL_CALORIES: Record<string, number> = {
  lose_weight: 1800,
  maintain_weight: 2200,
  gain_weight: 2600,
  build_muscle: 2600,
};

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose weight',
  maintain_weight: 'Maintain weight',
  gain_weight: 'Gain weight',
  build_muscle: 'Build muscle',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function PublicMealPlannerPage() {
  const [goal, setGoal] = useState('maintain_weight');
  const [restrictions, setRestrictions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setErrorMsg] = useState('');
  const [plan, setPlan] = useState<DayPlan | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setErrorMsg('');
    setPlan(null);

    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('id, name, category, calories, cost_naira')
      .not('cost_naira', 'is', null);

    if (foodsError || !foods) {
      setErrorMsg('Could not load food data. Please try again.');
      setGenerating(false);
      return;
    }

    const restrictedWords = restrictions
      .toLowerCase()
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const filtered = (foods as PlannerFood[]).filter((food) => {
      if (restrictedWords.length === 0) return true;
      const nameLower = food.name.toLowerCase();
      return !restrictedWords.some((word) => nameLower.includes(word));
    });

    const calorieTarget = GOAL_CALORIES[goal] ?? 2200;
    // No real budget constraint on this public teaser, so we pass a
    // large number that effectively disables cost filtering.
    const generated = generateDayPlan(filtered, calorieTarget, 100000);

    setPlan(generated);
    setGenerating(false);
  }

  return (
    <main className="public-planner-wrap">
      <h1 className="section-title size-l">
        A meal plan that actually fits your kitchen.
      </h1>
      <p className="section-desc">
        Tell us your goal and any food preferences, and we&apos;ll build a
        plan around meals you&apos;ll actually want to eat.
      </p>

      <div className="log-meal-field">
        <label htmlFor="goal">Your goal</label>
        <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="log-meal-field">
        <label htmlFor="restrictions">Restrictions (optional)</label>
        <input
          id="restrictions"
          type="text"
          placeholder="e.g. fish, egg"
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
        />
        <p className="public-planner-hint">
          Comma-separated, we&apos;ll avoid dishes matching these words.
        </p>
      </div>

      {error && <p className="log-meal-error">{error}</p>}

      <button
        type="button"
        className="log-meal-save-btn"
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? 'Building your plan...' : 'Generate my plan'}
      </button>

      {plan && (
        <div className="public-planner-results">
          <h2 className="section-title">Your plan, ready to go.</h2>

          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
            const slot = plan[mealType];
            if (slot.items.length === 0) return null;
            return (
              <div key={mealType} className="meal-plan-slot">
                <h3>{MEAL_LABELS[mealType]}</h3>
                <ul>
                  {slot.items.map((item, i) => (
                    <li key={i}>
                      <span>{item.food.name}</span>
                      <span>{Math.round(item.food.calories)} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <a href="/signup" className="about-hero-btn public-planner-save-btn">
            Save this plan — Sign up free
          </a>
        </div>
      )}
    </main>
  );
}