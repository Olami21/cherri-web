'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_weight', label: 'Gain weight' },
  { value: 'maintain_weight', label: 'Maintain weight' },
  { value: 'build_muscle', label: 'Build muscle' },
]

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [goal, setGoal] = useState('maintain_weight')
  const [hydrationTarget, setHydrationTarget] = useState('')
  const [dailyBudget, setDailyBudget] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setFullName(data.full_name || '')
        setHeightCm(data.height_cm ?? '')
        setWeightKg(data.weight_kg ?? '')
        setGoal(data.goal || 'maintain_weight')
        setHydrationTarget(data.hydration_target_ml ?? '')
        setDailyBudget(data.daily_budget_naira ?? '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        goal: goal,
        hydration_target_ml: hydrationTarget ? parseFloat(hydrationTarget) : null,
        daily_budget_naira: dailyBudget ? parseFloat(dailyBudget) : null,
      })
      .eq('user_id', userId)

    setSaving(false)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Profile saved.')
    }
  }

  if (loading) {
    return (
      <main className="profile-wrap">
        <p className="summary-hint">Loading...</p>
      </main>
    )
  }

  return (
    <main className="profile-wrap">
      <h1 className="section-title">Edit profile</h1>

      <form onSubmit={handleSave} className="profile-form">
        <div className="log-meal-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label htmlFor="height">Height (cm)</label>
          <input
            id="height"
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>

        <div className="log-meal-field">
          <label htmlFor="goal">Goal</label>
          <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {GOAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="log-meal-field">
          <label htmlFor="hydrationTarget">
            Daily water target (ml)
          </label>
          <input
            id="hydrationTarget"
            type="number"
            placeholder="Leave blank to use the default for your gender"
            value={hydrationTarget}
            onChange={(e) => setHydrationTarget(e.target.value)}
          />
          <p className="profile-field-hint">
            Set this if you have specific hydration needs, otherwise
            Cherri uses a sensible default.
          </p>
        </div>

        <div className="log-meal-field">
          <label htmlFor="dailyBudget">Default daily food budget (₦)</label>
          <input
            id="dailyBudget"
            type="number"
            placeholder="e.g. 2500"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
          />
          <p className="profile-field-hint">
            Used to pre-fill the meal planner, you can still change it
            each time you generate a plan.
          </p>
        </div>

        <button type="submit" className="log-meal-save-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>

        {message && <p className="profile-message">{message}</p>}
      </form>
    </main>
  )
}