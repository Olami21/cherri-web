'use client'

import { useEffect, useRef, useState } from 'react'

const STEPS = [
  {
    title: 'Create your profile',
    body: "Tell us your goals, your starting point, and what you're working with.",
  },
  {
    title: 'Log daily meals',
    body: "Track what you eat, the way you actually eat it — no converting your jollof into someone else's food database.",
  },
  {
    title: 'Get smart insights',
    body: 'Cherri turns your logs into patterns you can actually act on.',
  },
  {
    title: 'Connect & grow',
    body: 'Join a community building the same habits, and keep the momentum going.',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="how-section">
      <div className="wrap">
        <div className="how-header">
          <span className="tag">
            <span className="dot" />
            Your journey
          </span>
          <h2 className="section-title size-l">How Cherri works.</h2>
        </div>

        <div className={`how-steps ${inView ? 'is-in' : ''}`} ref={ref}>
          <svg className="how-line" viewBox="0 0 1000 2" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="1" x2="1000" y2="1" pathLength="100" />
          </svg>

          {STEPS.map((step, i) => (
            <div className="how-step" key={step.title} style={{ ['--i' as string]: i }}>
              <div className="how-num">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>

        <p className="pull-quote">We've got the data. You've got the drive.</p>
      </div>
    </section>
  )
}