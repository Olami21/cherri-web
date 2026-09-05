'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Food = {
  id: string;
  name: string;
  serving_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MAX_DIMENSION = 1024;

function resizeAndEncode(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ScanMealPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>('breakfast');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [noMatch, setNoMatch] = useState(false);

  const [matchedFood, setMatchedFood] = useState<Food | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [servings, setServings] = useState(1);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisError('');
    setNoMatch(false);
    setMatchedFood(null);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzing(true);

    try {
      const { base64, mimeType } = await resizeAndEncode(file);

      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setAnalysisError(result.error ?? 'Analysis failed. Please try again.');
        setAnalyzing(false);
        return;
      }

      setConfidence(result.confidence ?? null);
      setNotes(result.notes ?? '');

      if (!result.match) {
        setNoMatch(true);
        setAnalyzing(false);
        return;
      }

      const { data: food, error: foodError } = await supabase
        .from('foods')
        .select('id, name, serving_description, calories, protein_g, carbs_g, fat_g')
        .ilike('name', result.match)
        .single();

      if (foodError || !food) {
        setNoMatch(true);
        setAnalyzing(false);
        return;
      }

      setMatchedFood(food as Food);
      setAnalyzing(false);
    } catch (err) {
      setAnalysisError('Something went wrong analyzing the photo. Please try again.');
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!matchedFood) return;
    setSaving(true);
    setSaveError('');

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setSaveError('You need to be logged in to save a meal.');
      setSaving(false);
      return;
    }

    const loggedAt = new Date(`${date}T12:00:00`).toISOString();

    const { error } = await supabase.from('diet_logs').insert({
      user_id: user.id,
      food_id: matchedFood.id,
      meal_type: mealType,
      servings,
      logged_at: loggedAt,
    });

    if (error) {
      setSaveError('Something went wrong saving this meal. Please try again.');
      setSaving(false);
      return;
    }

    router.push('/dashboard/meals-today');
  }

  function reset() {
    setPreviewUrl(null);
    setMatchedFood(null);
    setNoMatch(false);
    setAnalysisError('');
    setConfidence(null);
    setNotes('');
    setServings(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="scan-meal-wrap">
      <h1 className="section-title">Snap a plate</h1>
      <p className="scan-meal-intro">
        Take or upload a photo of your meal, Cherri&apos;s AI will take a
        guess, and you confirm before it&apos;s logged.
      </p>

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

      {!previewUrl && (
        <div className="scan-meal-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            id="meal-photo"
            className="scan-meal-file-input"
          />
          <label htmlFor="meal-photo" className="scan-meal-upload-btn">
            📷 Take or choose a photo
          </label>
        </div>
      )}

      {previewUrl && (
        <div className="scan-meal-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Your meal" className="scan-meal-preview-img" />

          {analyzing && (
            <p className="scan-meal-hint">Analyzing your meal...</p>
          )}

          {analysisError && (
            <div>
              <p className="log-meal-error">{analysisError}</p>
              <button type="button" className="log-meal-change" onClick={reset}>
                ← Try another photo
              </button>
            </div>
          )}

          {noMatch && !analysisError && (
            <div className="scan-meal-nomatch">
              <p>
                Cherri couldn&apos;t confidently match this to a dish in our
                database yet.
                {notes && <span> ({notes})</span>}
              </p>
              <button type="button" className="log-meal-change" onClick={reset}>
                ← Try another photo
              </button>
              <a href="/dashboard/log-meal" className="scan-meal-manual-link">
                Log it manually instead →
              </a>
            </div>
          )}

          {matchedFood && (
            <div className="log-meal-confirm">
              <button type="button" className="log-meal-change" onClick={reset}>
                ← Try another photo
              </button>

              <h2>{matchedFood.name}</h2>
              {confidence !== null && (
                <p className="scan-meal-confidence">
                  Cherri is {confidence}% confident about this match.
                </p>
              )}
              <p className="log-meal-serving-base">
                1 serving = {matchedFood.serving_description}
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
                  <strong>{Math.round(matchedFood.calories * servings)}</strong>
                </div>
                <div>
                  <span>Protein</span>
                  <strong>{Math.round(matchedFood.protein_g * servings)}g</strong>
                </div>
                <div>
                  <span>Carbs</span>
                  <strong>{Math.round(matchedFood.carbs_g * servings)}g</strong>
                </div>
                <div>
                  <span>Fat</span>
                  <strong>{Math.round(matchedFood.fat_g * servings)}g</strong>
                </div>
              </div>

              {saveError && <p className="log-meal-error">{saveError}</p>}

              <button
                type="button"
                className="log-meal-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Confirm and save'}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}