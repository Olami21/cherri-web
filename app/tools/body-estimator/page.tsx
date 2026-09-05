'use client';

import { useState } from 'react';

type Result = {
  bmi: number;
  bodyFatPct: number;
  category: string;
};

function classifyBMI(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese (Class I)';
  if (bmi < 40) return 'Obese (Class II)';
  return 'Obese (Class III)';
}

export default function BodyEstimatorPage() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setErrorMsg] = useState('');

  function handleCalculate() {
    const heightCm = parseFloat(height);
    const weightKg = parseFloat(weight);
    const ageNum = parseFloat(age);

    if (!heightCm || !weightKg || !ageNum || heightCm <= 0 || weightKg <= 0 || ageNum <= 0) {
      setErrorMsg('Please fill in all fields with valid numbers.');
      setResult(null);
      return;
    }

    setErrorMsg('');

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    // Deurenberg formula (1991) — a peer-reviewed estimation method
    // using BMI, age, and sex. Genuinely computed, not a guess.
    const sexValue = gender === 'male' ? 1 : 0;
    const bodyFatPct = 1.2 * bmi + 0.23 * ageNum - 10.8 * sexValue - 5.4;

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      bodyFatPct: Math.round(bodyFatPct * 10) / 10,
      category: classifyBMI(bmi),
    });
  }

  return (
    <main className="estimator-wrap">
      <h1 className="section-title size-l">See where you&apos;re starting from.</h1>
      <p className="section-desc">
        Enter your height, weight, age, and gender, and we&apos;ll estimate
        your BMI and body fat percentage using established formulas.
      </p>

      <p className="estimator-disclaimer">
        This is an estimate, not a medical assessment. For diagnosis or
        treatment, please consult a qualified professional.
      </p>

      <div className="estimator-form">
        <div className="log-meal-field">
          <label htmlFor="height">Height (cm)</label>
          <input
            id="height"
            type="number"
            placeholder="e.g. 170"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            placeholder="e.g. 65"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            placeholder="e.g. 28"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label>Gender</label>
          <div className="log-meal-type-group">
            <button
              type="button"
              className={`log-meal-type-btn ${gender === 'female' ? 'is-active' : ''}`}
              onClick={() => setGender('female')}
            >
              Female
            </button>
            <button
              type="button"
              className={`log-meal-type-btn ${gender === 'male' ? 'is-active' : ''}`}
              onClick={() => setGender('male')}
            >
              Male
            </button>
          </div>
        </div>
      </div>

      {error && <p className="log-meal-error">{error}</p>}

      <button type="button" className="log-meal-save-btn" onClick={handleCalculate}>
        Calculate my estimate
      </button>

      {result && (
        <div className="estimator-results">
          <div className="log-meal-totals estimator-totals">
            <div>
              <span>Estimated BMI</span>
              <strong>{result.bmi}</strong>
            </div>
            <div>
              <span>Estimated body fat</span>
              <strong>{result.bodyFatPct}%</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{result.category}</strong>
            </div>
          </div>

          <a href="/signup" className="about-hero-btn estimator-save-btn">
            Save my result — Sign up free
          </a>
        </div>
      )}

      <div className="estimator-reference">
        <h2>WHO BMI classification (adults)</h2>
        <table className="estimator-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>BMI range</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Underweight</td><td>Below 18.5</td></tr>
            <tr><td>Normal weight</td><td>18.5 – 24.9</td></tr>
            <tr><td>Overweight</td><td>25.0 – 29.9</td></tr>
            <tr><td>Obese (Class I)</td><td>30.0 – 34.9</td></tr>
            <tr><td>Obese (Class II)</td><td>35.0 – 39.9</td></tr>
            <tr><td>Obese (Class III)</td><td>40.0 and above</td></tr>
          </tbody>
        </table>
        <p className="estimator-table-note">
          These WHO ranges apply to adults generally and don&apos;t vary by
          age bracket, unlike children and adolescents, who are assessed
          using separate BMI-for-age growth charts, not these adult cutoffs.
          BMI is also less accurate for pregnant or breastfeeding women, and
          for very muscular individuals, since it can&apos;t distinguish
          muscle mass from fat mass.
        </p>
      </div>
    </main>
  );
}