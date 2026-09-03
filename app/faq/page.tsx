export default function FAQPage() {
  const faqs = [
    {
      q: "Is Cherri free to use?",
      a: "Yes, our core tools and content are free. Some features may require a free account.",
    },
    {
      q: "Is the body estimator tool medically accurate?",
      a: "It gives a general estimate for informational purposes only, and is not a substitute for professional medical or clinical assessment.",
    },
    {
      q: "Do I need an account to use the tools?",
      a: "You can try most tools without an account, but creating one lets you save your history and progress.",
    },
  ]

  return (
    <main style={{ maxWidth: 700, margin: '60px auto', padding: '0 24px' }}>
      <h1>Frequently Asked Questions</h1>
      <div style={{ marginTop: 24 }}>
        {faqs.map((item, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <h3>{item.q}</h3>
            <p style={{ color: '#555' }}>{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  )
}