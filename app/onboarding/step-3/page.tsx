'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import OnboardingShell from '../../../components/OnboardingShell'

const goals = [
  { value: 'lose_weight', title: 'Lose Weight', desc: 'Build a sustainable calorie deficit without giving up the meals you love.' },
  { value: 'gain_weight', title: 'Gain Weight', desc: 'Add healthy weight with a plan built around your appetite and routine.' },
  { value: 'maintain_weight', title: 'Maintain Weight', desc: 'Stay consistent and keep your current progress steady.' },
  { value: 'build_muscle', title: 'Build Muscle', desc: 'Fuel your training with a plan focused on strength and recovery.' },
]

export default function OnboardingStep3() {
  const [goal, setGoal] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleNext = async () => {
    setError('')
    if (!goal) {
      setError('Please select a goal to continue.')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ goal })
      .eq('user_id', session.user.id)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/onboarding/complete')
  }

  return (
    <OnboardingShell currentStep={3} quote="One last step before your plan comes together.">
      <div className="onboard-form-wrap">
        <span className="tag"><span className="dot" />Step 3 of 3</span>
        <h1>What's your goal?</h1>
        <p>This shapes your daily targets and the insights Cherri gives you.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {goals.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGoal(g.value)}
              className={`onboard-goal-card ${goal === g.value ? 'selected' : ''}`}
            >
              <h3>{g.title}</h3>
              <p>{g.desc}</p>
            </button>
          ))}
        </div>

        {error && <p style={{ color: 'var(--ember)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button onClick={handleNext} className="btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
          Continue
        </button>
      </div>
    </OnboardingShell>
  )
}