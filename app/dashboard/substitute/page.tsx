'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { findSubstitutes, SubstitutionFood, Substitute } from '@/lib/substitution';

export default function SubstitutePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubstitutionFood[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedFood, setSelectedFood] = useState<SubstitutionFood | null>(null);
  const [substitutes, setSubstitutes] = useState<Substitute[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
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
        .select('id, name, category, serving_description, calories, protein_g, carbs_g, fat_g')
        .ilike('name', `%${query.trim()}%`)
        .order('name')
        .limit(10);

      if (!error && data) setResults(data as SubstitutionFood[]);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function handleSelect(food: SubstitutionFood) {
    setSelectedFood(food);
    setQuery('');
    setResults([]);
    setLoadingSubs(true);
    setErrorMsg('');

    const { data: allFoods, error } = await supabase
      .from('foods')
      .select('id, name, category, serving_description, calories, protein_g, carbs_g, fat_g');

    if (error || !allFoods) {
      setErrorMsg('Could not load substitutes. Please try again.');
      setLoadingSubs(false);
      return;
    }

    const subs = findSubstitutes(food, allFoods as SubstitutionFood[]);
    setSubstitutes(subs);
    setLoadingSubs(false);
  }

  function reset() {
    setSelectedFood(null);
    setSubstitutes([]);
    setQuery('');
  }

  return (
    <main className="substitute-wrap">
      <h1 className="section-title">Find a substitute</h1>
      <p className="scan-meal-intro">
        Don&apos;t have something on hand? Search it and we&apos;ll suggest
        similar options from our food database.
      </p>

      {!selectedFood && (
        <div className="log-meal-search">
          <label htmlFor="sub-search">What don&apos;t you have?</label>
          <input
            id="sub-search"
            type="text"
            placeholder="e.g. chicken, rice, fish"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          {searching && <p className="log-meal-hint">Searching...</p>}

          {results.length > 0 && (
            <ul className="log-meal-results">
              {results.map((food) => (
                <li key={food.id}>
                  <button type="button" onClick={() => handleSelect(food)}>
                    <span className="log-meal-result-name">{food.name}</span>
                    <span className="log-meal-result-meta">
                      {food.serving_description} · {food.calories} kcal
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedFood && (
        <div className="substitute-results">
          <button type="button" className="substitute-back-btn" onClick={reset}>
            ← Search something else
          </button>

          <p className="substitute-target-label">
            Alternatives to <strong>{selectedFood.name}</strong>
          </p>

          {loadingSubs && <p className="log-meal-hint">Finding alternatives...</p>}
          {error && <p className="log-meal-error">{error}</p>}

          {!loadingSubs && substitutes.length === 0 && !error && (
            <p className="log-meal-hint">
              No close alternatives found in the same category yet.
            </p>
          )}

          {substitutes.length > 0 && (
            <ul className="substitute-list">
              {substitutes.map((sub) => (
                <li key={sub.id}>
                  <div>
                    <span className="substitute-name">{sub.name}</span>
                    <span className="substitute-label">{sub.similarityLabel}</span>
                  </div>
                  <span className="substitute-cal">{Math.round(sub.calories)} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}