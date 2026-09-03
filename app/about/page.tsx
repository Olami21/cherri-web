import Reveal from '@/components/Reveal';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="wrap about-hero-grid">
          <div className="about-hero-copy">
            <span className="tag hero-anim hero-anim-1">
              <span className="dot" />
              About Cherri
            </span>
            <h1 className="section-title size-l hero-anim hero-anim-2">
              Built by people who understand the assignment.
            </h1>
            <p className="section-desc about-hero-intro hero-anim hero-anim-3">
              Cherri started as a frustration with apps that never quite
              fit, and grew into a wellness ecosystem built specifically
              for us.
            </p>
            <a href="/#signup-section" className="about-hero-btn hero-anim hero-anim-4">
              Join Early Access
            </a>
          </div>

          <div className="about-hero-media hero-anim hero-anim-3">
            <div className="about-hero-shape" aria-hidden="true" />
            <div className="about-hero-photo">
              <Image
                src="/images/about/hero-bowl.jpg"
                alt="A home-cooked Nigerian meal, plated"
                fill
                sizes="(max-width: 768px) 90vw, 480px"
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="about-hero-float">
              <p>
                Wellness, built from local food and local life, not
                translated from someone else&apos;s plate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OUR STORY ================= */}
      <Reveal>
        <section className="about-story">
          <div className="wrap about-story-grid">
            <div className="about-story-media">
              <Image
                src="/images/about/story-kitchen.jpg"
                alt="Preparing a meal in a home kitchen"
                fill
                sizes="(max-width: 768px) 90vw, 420px"
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div className="about-story-copy">
              <span className="tag">
                <span className="dot" />
                Our Story
              </span>
              <h2 className="section-title">Why we built Cherri.</h2>

              <div className="about-story-body">
                <p>
                  Cherri didn&apos;t start in a boardroom. It started with
                  two founders noticing the same gap over and over: every
                  nutrition app they tried treated local food as an
                  afterthought, if it recognized it at all.
                </p>
                <p>
                  Logging a plate of eba and egusi meant guessing,
                  converting, or giving up. Getting real guidance meant
                  paying for something most people simply couldn&apos;t
                  justify. And staying consistent meant fighting an app
                  that wasn&apos;t built with African routines, budgets, or
                  internet realities in mind.
                </p>
                <p>
                  We built Cherri to close that gap, a platform that
                  starts from local food, local life, and local goals,
                  then brings in the technology to make sense of it all.
                </p>
                <p>
                  What makes Cherri different isn&apos;t just the data.
                  It&apos;s the intent behind it: every feature is built to
                  be used by someone juggling a full day, a tight budget,
                  and a genuine desire to feel better in their body, not
                  someone with unlimited time and a personal trainer on
                  call.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ================= VISION & MISSION ================= */}
      <section className="about-vision">
        <div className="wrap about-vision-grid">
          <div className="about-vision-card about-vision-card--wide">
            <span className="about-vision-mark" aria-hidden="true">
              &ldquo;
            </span>
            <span className="tag">
              <span className="dot" />
              Vision
            </span>
            <p>
              To become Africa&apos;s most trusted wellness companion,
              empowering millions to take control of their health through
              accessible technology and culturally relevant guidance.
            </p>
          </div>
          <div className="about-vision-card">
            <span className="tag">
              <span className="dot" />
              Mission
            </span>
            <p>
              We make wellness simple, affordable, and achievable for
              every African by combining AI-powered insights with
              accurate nutrition tracking for local foods and tools that
              meet people exactly where they are.
            </p>
          </div>
        </div>
      </section>

      {/* ================= OUR VALUES ================= */}
      <section className="about-values">
        <div className="wrap">
          <span className="tag">
            <span className="dot" />
            What We Stand For
          </span>
          <h2 className="section-title">Our Values</h2>

          <div className="about-values-list">
            <div className="about-value-row">
              <h3>Accessibility first</h3>
              <p>
                Wellness isn&apos;t a luxury. We design for real lives,
                tight budgets, inconsistent internet, and busy schedules,
                so expert-level guidance isn&apos;t locked behind a price
                tag.
              </p>
            </div>
            <div className="about-value-row">
              <h3>Cultural relevance</h3>
              <p>
                We celebrate African foods and lifestyles as they are, not
                as imported templates. Wellness looks different across
                cultures, and Cherri is built from the ground up to
                reflect that.
              </p>
            </div>
            <div className="about-value-row">
              <h3>Empowerment through knowledge</h3>
              <p>
                We don&apos;t just tell you what to do, we help you
                understand why. Better health literacy leads to better
                choices, long after you&apos;ve stopped checking the app.
              </p>
            </div>
            <div className="about-value-row">
              <h3>Human plus technology</h3>
              <p>
                AI is powerful, but it&apos;s not enough on its own. We
                pair smart technology with real understanding of how
                people actually live.
              </p>
            </div>
            <div className="about-value-row">
              <h3>Sustainable progress</h3>
              <p>
                We&apos;re not selling shortcuts or overnight
                transformations. We&apos;re here for the long haul,
                building habits that last and celebrating every small win
                along the way.
              </p>
            </div>
            <div className="about-value-row">
              <h3>Community and partnership</h3>
              <p>
                Your wellness affects the people around you. We build
                spaces where users show up for each other, not just for
                themselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUNDERS ================= */}
      <Reveal>
        <section className="about-founders">
          <div className="wrap">
            <span className="tag">
              <span className="dot" />
              Meet The Founders
            </span>
            <h2 className="section-title">Who&apos;s building this</h2>

            <div className="about-founders-grid">
              <div className="about-founder-card">
                <div className="about-founder-photo">
                  <Image
                    src="/images/about/founder-joseph.jpg"
                    alt="Joseph Olamide Peculiar"
                    fill
                    sizes="(max-width: 768px) 90vw, 320px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3>Joseph Olamide Peculiar</h3>
                <span className="about-founder-role">
                  Co-Founder & Senior Developer
                </span>
                <p>
                  Joseph leads Cherri&apos;s product and engineering,
                  building the app from the ground up with a focus on
                  performance, reliability, and design that feels premium
                  without feeling out of reach.
                </p>
              </div>

              <div className="about-founder-card">
                <div className="about-founder-photo">
                  <Image
                    src="/images/about/founder-adebisi.jpg"
                    alt="Adebisi Festus Adeayo"
                    fill
                    sizes="(max-width: 768px) 90vw, 320px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3>Adebisi Festus Adeayo</h3>
                <span className="about-founder-role">Co-Founder</span>
                <p>
                  Adebisi brings the vision for what Cherri should feel
                  like to the people using it, a friend in your corner,
                  not a distant expert.
                </p>
              </div>
            </div>

            <p className="about-founders-closing">
              Cherri is being built the way it&apos;s meant to be used,
              one honest iteration at a time, shaped by the people
              who&apos;ll actually rely on it.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ================= CTA BAND ================= */}
      <section className="about-cta">
        <svg
          className="about-cta-mark"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <circle cx="20" cy="24" r="12" fill="var(--ember)" />
          <path
            d="M20 12c0-6 4-9 8-10-1 5-3 8-8 10z"
            fill="var(--sprout)"
          />
        </svg>
        <div className="wrap about-cta-inner">
          <h2 className="section-title size-l">
            Ready to build a wellness routine that actually fits your
            life?
          </h2>
          <p className="section-desc">
            Join early access and help shape Cherri before we launch.
          </p>
          <a href="/#signup-section" className="about-cta-btn">
            Join Early Access
          </a>
        </div>
      </section>
    </main>
  );
}