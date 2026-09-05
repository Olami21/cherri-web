'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  generateDayPlan,
  generateWeekPlan,
  DayPlan,
  PlannerFood,
} from '@/lib/mealPlanner';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function MealPlanPage() {
  const [budget, setBudget] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);

  const [planType, setPlanType] = useState<'daily' | 'weekly' | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    async function loadDefaultBudget() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_budget_naira')
        .eq('user_id', user.id)
        .single();

      if (profile?.daily_budget_naira) {
        setBudget(String(profile.daily_budget_naira));
      }
    }

    loadDefaultBudget();
  }, []);

  async function handleGenerate(type: 'daily' | 'weekly') {
    const budgetNum = parseFloat(budget);
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMsg('Please enter a valid daily budget.');
      return;
    }

    setErrorMsg('');
    setSaved(false);
    setGenerating(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setErrorMsg('You need to be logged in to generate a meal plan.');
      setGenerating(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('calorie_target')
      .eq('user_id', user.id)
      .single();

    if (!profile?.calorie_target) {
      setErrorMsg('Complete your profile setup first, a calorie target is needed to build a plan.');
      setGenerating(false);
      return;
    }

    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('id, name, category, calories, cost_naira')
      .not('cost_naira', 'is', null);

    if (foodsError || !foods || foods.length === 0) {
      setErrorMsg('Could not load food pricing data.');
      setGenerating(false);
      return;
    }

    const priced = foods as PlannerFood[];

    if (type === 'daily') {
      const plan = generateDayPlan(priced, profile.calorie_target, budgetNum);
      setDayPlans([plan]);
    } else {
      const plans = generateWeekPlan(priced, profile.calorie_target, budgetNum);
      setDayPlans(plans);
    }

    setPlanType(type);
    setActiveDay(0);
    setGenerating(false);
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg('');

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user || !planType) {
      setSaving(false);
      return;
    }

    const { data: plan, error: planError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        plan_type: planType,
        start_date: new Date().toISOString().slice(0, 10),
        budget_naira: parseFloat(budget),
      })
      .select()
      .single();

    if (planError || !plan) {
      setErrorMsg('Could not save this plan. Please try again.');
      setSaving(false);
      return;
    }

    const items = dayPlans.flatMap((day, dayIndex) =>
      (['breakfast', 'lunch', 'dinner', 'snack'] as const).flatMap((mealType) =>
        day[mealType].items.map((item) => ({
          plan_id: plan.id,
          day_offset: dayIndex,
          meal_type: mealType,
          food_id: item.food.id,
          servings: item.servings,
          cost_naira: item.food.cost_naira,
          calories: item.food.calories,
        }))
      )
    );

    const { error: itemsError } = await supabase.from('meal_plan_items').insert(items);

    if (itemsError) {
      setErrorMsg('Plan saved, but some items failed to save. Please try again.');
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
  }

  const currentDay = dayPlans[activeDay];

  return (
    <main className="meal-plan-wrap">
      <h1 className="section-title">Meal planner</h1>
      <p className="meal-plan-intro">
        Tell us your daily food budget, and we&apos;ll put together meals
        that fit your calorie target and your pocket.
      </p>

      <div className="log-meal-field meal-plan-budget-field">
        <label htmlFor="budget">Daily budget (₦)</label>
        <input
          id="budget"
          type="number"
          min="0"
          step="50"
          placeholder="e.g. 2500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      {error && <p className="log-meal-error">{error}</p>}

      <div className="meal-plan-generate-row">
        <button
          type="button"
          className="log-meal-save-btn meal-plan-generate-btn"
          onClick={() => handleGenerate('daily')}
          disabled={generating}
        >
          {generating ? 'Generating...' : "Generate today's plan"}
        </button>
        <button
          type="button"
          className="log-meal-type-btn meal-plan-generate-btn"
          onClick={() => handleGenerate('weekly')}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate weekly plan'}
        </button>
      </div>

      {dayPlans.length > 0 && (
        <div className="meal-plan-results">
          {planType === 'weekly' && (
            <div className="meal-plan-day-tabs">
              {dayPlans.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`meal-plan-day-tab ${activeDay === i ? 'is-active' : ''}`}
                  onClick={() => setActiveDay(i)}
                >
                  Day {i + 1}
                </button>
              ))}
            </div>
          )}

          {currentDay && (
            <>
              <div className="meal-plan-day-total">
                <span>{Math.round(currentDay.dayTotalCalories)} kcal</span>
                <span>₦{Math.round(currentDay.dayTotalCost).toLocaleString()}</span>
              </div>

              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
                const slot = currentDay[mealType];
                if (slot.items.length === 0) return null;
                return (
                  <div key={mealType} className="meal-plan-slot">
                    <h3>{MEAL_LABELS[mealType]}</h3>
                    <ul>
                      {slot.items.map((item, i) => (
                        <li key={i}>
                          <span>{item.food.name}</span>
                          <span>₦{Math.round(item.food.cost_naira).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="meal-plan-slot-total">
                      {Math.round(slot.totalCalories)} kcal · ₦
                      {Math.round(slot.totalCost).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {saved ? (
            <p className="meal-plan-saved">
              Plan saved. You can build a grocery list from it now.
              <br />
              <a href="/dashboard/grocery-list" className="log-meal-change">
                View grocery list →
              </a>
            </p>
          ) : (
            <button
              type="button"
              className="log-meal-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save this plan'}
            </button>
          )}
        </div>
      )}
    </main>
  );
}