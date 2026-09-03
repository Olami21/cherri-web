'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function useCountUp(target: number, duration = 1100, start: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start || target === 0) return
    let startTime: number | null = null
    let frame: number
    const step = (ts: number) => {
      if (startTime === null) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])
  return value
}

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#F9DD9C' }
  if (bmi < 25) return { label: 'Healthy range', color: '#4E9F5C' }
  if (bmi < 30) return { label: 'Overweight', color: '#E9A400' }
  return { label: 'Obese', color: '#C1362B' }
}

export default function OnboardingComplete() {
  const [loading, setLoading] = useState(true)
  const [targets, setTargets] = useState<{ calories: number; protein: number; carbs: number; fat: number; bmi: number } | null>(null)
  const [reveal, setReveal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const calculate = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!profile) {
        router.push('/dashboard/profile')
        return
      }

      const { weight_kg, height_cm, age, gender, activity_level, goal } = profile

      let bmr
      if (gender === 'male') {
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      } else {
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      }

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
      }
      const tdee = bmr * (activityMultipliers[activity_level] || 1.2)

      let calories = tdee
      if (goal === 'lose_weight') calories = tdee - 500
      if (goal === 'gain_weight') calories = tdee + 300
      if (goal === 'build_muscle') calories = tdee + 250
      calories = Math.round(calories)

      let proteinPct = 0.30, carbsPct = 0.40, fatPct = 0.30
      if (goal === 'build_muscle') { proteinPct = 0.35; carbsPct = 0.35; fatPct = 0.30 }

      const protein = Math.round((calories * proteinPct) / 4)
      const carbs = Math.round((calories * carbsPct) / 4)
      const fat = Math.round((calories * fatPct) / 9)

      const heightM = height_cm / 100
      const bmi = Math.round((weight_kg / (heightM * heightM)) * 10) / 10

      await supabase
        .from('profiles')
        .update({
          calorie_target: calories,
          protein_target_g: protein,
          carbs_target_g: carbs,
          fat_target_g: fat,
        })
        .eq('user_id', session.user.id)

      setTargets({ calories, protein, carbs, fat, bmi })
      setLoading(false)
      setTimeout(() => setReveal(true), 100)
    }

    calculate()
  }, [router])

  const animatedCalories = useCountUp(targets?.calories || 0, 1200, reveal)
  const animatedProtein = useCountUp(targets?.protein || 0, 1000, reveal)
  const animatedCarbs = useCountUp(targets?.carbs || 0, 1000, reveal)
  const animatedFat = useCountUp(targets?.fat || 0, 1000, reveal)

  if (loading || !targets) {
    return (
      <main className="complete-wrap">
        <p style={{ color: 'rgba(246,241,228,0.7)' }}>Calculating your plan...</p>
      </main>
    )
  }

  const category = bmiCategory(targets.bmi)
  const bmiPercent = Math.min(Math.max((targets.bmi - 15) / (35 - 15), 0), 1)
  const circumference = 2 * Math.PI * 40
  const offset = reveal ? circumference * (1 - bmiPercent) : circumference

  return (
    <main className="complete-wrap">
      <div className="complete-card">
        <span className="tag"><span className="dot" />All set</span>
        <h1>Your plan is ready</h1>
        <p>Based on what you told us, here's your daily target, built to fit your goal, not fight it.</p>

        <div className="complete-panel">
          <div className="complete-calorie">{animatedCalories}</div>
          <div className="complete-calorie-label">calories / day</div>

          <div className="complete-macros">
            <div>
              <div className="complete-macro-val">{animatedProtein}g</div>
              <div className="complete-macro-label">Protein</div>
            </div>
            <div>
              <div className="complete-macro-val">{animatedCarbs}g</div>
              <div className="complete-macro-label">Carbs</div>
            </div>
            <div>
              <div className="complete-macro-val">{animatedFat}g</div>
              <div className="complete-macro-label">Fat</div>
            </div>
          </div>
        </div>

        <div className="bmi-panel">
          <div className="bmi-gauge">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(246,241,228,0.12)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={category.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
              />
            </svg>
            <div className="bmi-gauge-value">
              <div className="num">{targets.bmi}</div>
              <div className="lbl">BMI</div>
            </div>
          </div>
          <div className="bmi-info">
            <div className="bmi-category" style={{ color: category.color }}>{category.label}</div>
            <p>Based on your height and weight. BMI is a general indicator, not a full picture of your health.</p>
          </div>
        </div>

        <button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
          Go to my dashboard
        </button>
      </div>
    </main>
  )
}