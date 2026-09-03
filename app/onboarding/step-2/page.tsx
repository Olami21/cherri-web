'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import OnboardingShell from '../../../components/OnboardingShell'

export default function OnboardingStep2() {
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
    { value: 'light', label: 'Lightly active', desc: 'Exercise 1-3 days a week' },
    { value: 'moderate', label: 'Moderately active', desc: 'Exercise 3-5 days a week' },
    { value: 'active', label: 'Very active', desc: 'Exercise 6-7 days a week' },
  ]

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        weight_kg: parseFloat(weightKg),
        height_cm: parseFloat(heightCm),
        activity_level: activityLevel,
      })
      .eq('user_id', session.user.id)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/onboarding/step-3')
  }

  return (
    <OnboardingShell currentStep={2} quote="A baseline that actually reflects where you're starting from.">
      <div className="onboard-form-wrap">
        <span className="tag"><span className="dot" />Step 2 of 3</span>
        <h1>Your starting point</h1>
        <p>This helps Cherri build a baseline made for you.</p>

        <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="onboard-field" style={{ flex: 1 }}>
              <label>Weight (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
            </div>
            <div className="onboard-field" style={{ flex: 1 }}>
              <label>Height (cm)</label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--forest)', marginBottom: 10 }}>
              Activity level
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activityOptions.map((opt) => (
                <label key={opt.value} className={`onboard-radio-card ${activityLevel === opt.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="activity"
                    value={opt.value}
                    checked={activityLevel === opt.value}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    required
                    style={{ accentColor: 'var(--forest)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--forest)' }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p style={{ color: 'var(--ember)', fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}>
            Continue
          </button>
        </form>
      </div>
    </OnboardingShell>
  )
}