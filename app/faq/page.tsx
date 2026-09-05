'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is Cherri free to use?',
    a: 'Yes, our core tools and content are free. Some features may require a free account to save your history and progress.',
  },
  {
    q: 'Does Cherri actually recognize Nigerian dishes?',
    a: 'Yes, that\u2019s the whole point. Cherri\u2019s food database is built around local dishes like jollof rice, egusi soup, and moin moin, not adapted from a Western food list.',
  },
  {
    q: 'Is the body estimator tool medically accurate?',
    a: 'It gives a general estimate for informational purposes only, using established formulas like BMI and the Deurenberg body fat equation. It is not a substitute for professional medical or clinical assessment.',
  },
  {
    q: 'Do I need an account to use the tools?',
    a: 'You can try most tools, like the Meal Planner and Body Estimator, without an account. Creating one lets you save your results, log meals daily, and track progress over time.',
  },
  {
    q: 'How does the meal planner handle my budget?',
    a: 'Tell it your daily food budget, and it builds meals from our food database that fit both your calorie target and your budget as closely as possible.',
  },
  {
    q: 'Can I use Cherri if I have specific dietary needs?',
    a: 'You can set restrictions when generating a meal plan, and set a personalized hydration target in your profile if the default doesn\u2019t fit your needs. More personalization is on the way.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="faq-wrap">
      <section className="faq-hero">
        <div className="wrap">
          <h1 className="section-title size-l">Frequently asked questions</h1>
          <p className="section-desc">
            Everything you need to know before you get started.
          </p>
        </div>
      </section>

      <section className="faq-list-section">
        <div className="wrap faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    {isOpen ? '\u2212' : '+'}
                  </span>
                </button>
                {isOpen && <p className="faq-answer">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}