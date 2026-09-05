export default function CommunityPage() {
  return (
    <main className="community-page-wrap">
      <section className="community-page-hero">
        <div className="wrap">
          <span className="tag">
            <span className="dot" />
            Community
          </span>
          <h1 className="section-title size-l">
            You&apos;re not doing this alone.
          </h1>
          <p className="section-desc community-page-intro">
            Connect with people building the same habits, sharing the same
            wins, and asking the same questions you are.
          </p>

          {/* TODO: replace "#" with the real WhatsApp community invite link once created */}
          <a href="#" className="about-hero-btn community-page-cta">
            Join our WhatsApp community
          </a>
        </div>
      </section>

      <section className="community-page-values">
        <div className="wrap community-page-values-grid">
          <div className="community-page-value-card">
            <h3>Real conversations</h3>
            <p>
              Ask questions about a meal, a plateau, or a goal, and get
              answers from people who actually understand the food and
              life you&apos;re navigating.
            </p>
          </div>
          <div className="community-page-value-card">
            <h3>Shared accountability</h3>
            <p>
              Share your wins, your rough days, and everything between.
              Consistency is easier when you&apos;re not carrying it
              alone.
            </p>
          </div>
          <div className="community-page-value-card">
            <h3>No judgment, ever</h3>
            <p>
              This is a space to be honest about where you are, not
              perform progress you don&apos;t feel yet.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}