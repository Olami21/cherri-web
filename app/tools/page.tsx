import Link from 'next/link';

const TOOLS = [
  {
    slug: 'body-estimator',
    title: 'Body Estimator',
    description:
      'Get a quick estimate of your body composition using your height and weight.',
  },
  {
    slug: null,
    href: '/signup',
    title: 'Diet Tracker',
    description:
      'Log a meal and see exactly what\u2019s in it, local dishes included.',
  },
  {
    slug: 'meal-planner',
    title: 'Meal Planner',
    description:
      'Tell us your goal and get a plan built around food you\u2019ll actually find and enjoy.',
  },
];

export default function ToolsLandingPage() {
  return (
    <main className="tools-wrap">
      <section className="tools-hero">
        <div className="wrap">
          <h1 className="section-title size-l">Try Cherri&apos;s tools.</h1>
          <p className="section-desc">
            A few of Cherri&apos;s smart tools, free to try before you sign up.
          </p>
        </div>
      </section>

      <section className="tools-grid-section">
        <div className="wrap tools-grid">
          {TOOLS.map((tool) => (
            <div key={tool.title} className="tools-card">
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
              <Link
                href={tool.href ?? `/tools/${tool.slug}`}
                className="tools-card-link"
              >
                Try it →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}