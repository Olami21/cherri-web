'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Food = {
  id: string;
  name: string;
  category: string;
  serving_description: string;
  serving_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function LogMealPage() {
  const router = useRouter();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>('breakfast');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setErrorMsg] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .order('name')
        .limit(15);

      if (!error && data) setResults(data as Food[]);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function handleSave() {
    if (!selectedFood) return;
    setSaving(true);
    setErrorMsg('');

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setErrorMsg('You need to be logged in to save a meal.');
      setSaving(false);
      return;
    }

    const loggedAt = new Date(`${date}T12:00:00`).toISOString();

    const { error } = await supabase.from('diet_logs').insert({
      user_id: user.id,
      food_id: selectedFood.id,
      meal_type: mealType,
      servings,
      logged_at: loggedAt,
    });

    if (error) {
      setErrorMsg('Something went wrong saving this meal. Please try again.');
      setSaving(false);
      return;
    }

    router.push('/dashboard/meals-today');
  }

  return (
    <main className="log-meal-wrap">
      <h1 className="section-title">Log a meal</h1>

      {/* Step 1: date + meal type */}
      <div className="log-meal-context">
        <div className="log-meal-field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label>Meal</label>
          <div className="log-meal-type-group">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`log-meal-type-btn ${mealType === type ? 'is-active' : ''}`}
                onClick={() => setMealType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: search food */}
      {!selectedFood && (
        <div className="log-meal-search">
          <label htmlFor="food-search">What did you eat?</label>
          <input
            id="food-search"
            type="text"
            placeholder="Search e.g. jollof rice, akara, egusi soup"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          {searching && <p className="log-meal-hint">Searching...</p>}

          {results.length > 0 && (
            <ul className="log-meal-results">
              {results.map((food) => (
                <li key={food.id}>
                  <button type="button" onClick={() => setSelectedFood(food)}>
                    <span className="log-meal-result-name">{food.name}</span>
                    <span className="log-meal-result-meta">
                      {food.serving_description} · {food.calories} kcal
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.trim().length >= 2 && !searching && results.length === 0 && (
            <p className="log-meal-hint">
              No matches yet. Try a different spelling, or check back soon,
              we&apos;re adding more dishes regularly.
            </p>
          )}
        </div>
      )}

      {/* Step 3: confirm servings + save */}
      {selectedFood && (
        <div className="log-meal-confirm">
          <button
            type="button"
            className="log-meal-change"
            onClick={() => {
              setSelectedFood(null);
              setServings(1);
            }}
          >
            ← Change food
          </button>

          <h2>{selectedFood.name}</h2>
          <p className="log-meal-serving-base">
            1 serving = {selectedFood.serving_description}
          </p>

          <div className="log-meal-field">
            <label htmlFor="servings">Servings</label>
            <input
              id="servings"
              type="number"
              min={0.25}
              step={0.25}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </div>

          <div className="log-meal-totals">
            <div>
              <span>Calories</span>
              <strong>{Math.round(selectedFood.calories * servings)}</strong>
            </div>
            <div>
              <span>Protein</span>
              <strong>{Math.round(selectedFood.protein_g * servings)}g</strong>
            </div>
            <div>
              <span>Carbs</span>
              <strong>{Math.round(selectedFood.carbs_g * servings)}g</strong>
            </div>
            <div>
              <span>Fat</span>
              <strong>{Math.round(selectedFood.fat_g * servings)}g</strong>
            </div>
          </div>

          {error && (
            <p className="log-meal-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="log-meal-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save meal'}
          </button>
        </div>
      )}
    </main>
  );
}