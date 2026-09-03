'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import OnboardingShell from '../../../components/OnboardingShell'

export default function OnboardingStep1() {
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

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
      .update({ full_name: fullName, age: parseInt(age), gender })
      .eq('user_id', session.user.id)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/onboarding/step-2')
  }

  return (
    <OnboardingShell currentStep={1} quote="Wellness that finally speaks your language starts here.">
      <div className="onboard-form-wrap">
        <span className="tag"><span className="dot" />Step 1 of 3</span>
        <h1>Tell us about you</h1>
        <p>The basics, so Cherri knows who it's talking to.</p>

        <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="onboard-field">
            <label>Full name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="onboard-field">
            <label>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required min="13" max="100" />
          </div>
          <div className="onboard-field">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
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