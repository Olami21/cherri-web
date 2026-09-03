import { ReactNode } from 'react'

const STEPS = ['Tell us about you', 'Your starting point', "What's your goal"]

export default function OnboardingShell({
  currentStep,
  quote,
  children,
}: {
  currentStep: number
  quote: string
  children: ReactNode
}) {
  return (
    <div className="onboard-wrap">
      <div className="onboard-side">
        <div className="onboard-mark">Cherri</div>
        <p className="onboard-quote">{quote}</p>
        <div className="onboard-steps-list">
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const status = stepNum < currentStep ? 'done' : stepNum === currentStep ? 'active' : ''
            return (
              <div key={label} className={`onboard-step-item ${status}`}>
                <div className="onboard-step-num">{stepNum < currentStep ? '✓' : stepNum}</div>
                <p>{label}</p>
              </div>
            )
          })}
        </div>
      </div>
      <div className="onboard-main">
        {children}
      </div>
    </div>
  )
}