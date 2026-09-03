import Link from 'next/link'
import Image from 'next/image'
import {
  Utensils, Wallet, RefreshCw, Check,
  Camera, CalendarDays, LineChart, MessageCircle, Sparkles, BookOpen,
  ArrowRight,
} from 'lucide-react'
import HowItWorks from '../components/HowItWorks'

export default function HomePage() {
  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="tag seq" style={{ ['--d' as string]: 0 }}>
              <span className="dot" />
              Now accepting early access
            </span>
            <h1 className="seq" style={{ ['--d' as string]: 1 }}>
              Your wellness, finally speaking your language.
            </h1>
            <p className="hero-sub seq" style={{ ['--d' as string]: 2 }}>
              Cherri tracks what you actually eat, including jollof, fufu, moin
              moin and more, and turns it into insights you can use instead of
              guesswork you have to translate.
            </p>
            <div className="hero-ctas seq" style={{ ['--d' as string]: 3 }}>
              <Link href="/signup" className="btn-primary">
                Join early access <ArrowRight size={16} />
              </Link>
              <Link href="#how-it-works" className="btn-secondary">
                See how it works
              </Link>
            </div>
            <div className="hero-stat seq" style={{ ['--d' as string]: 4 }}>
              <div className="hero-stat-avatars">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Join 1,000+ early members building better habits with Cherri</p>
            </div>
          </div>

          <div className="hero-visual">
            <Image
              src="/images/hero-dish.jpg"
              alt="A plated Nigerian dish"
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
            <div className="hero-float-card">
              <span className="live-dot" />
              <p>Egusi soup logged in 4 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE PROBLEM ================= */}
      <section className="problem-section">
        <div className="wrap">
          <div className="problem-header">
            <span className="tag">
              <span className="dot" />
              The problem
            </span>
            <h2 className="section-title size-l">
              Wellness apps weren't built with us in mind.
            </h2>
          </div>

          <div className="problem-list">
            <div className="problem-row">
              <div className="mark">
                <Utensils size={16} />
              </div>
              <h3>Your food isn't in the app.</h3>
              <p>
                Most nutrition apps were built for oatmeal and quinoa. The
                moment you log ogbono soup or amala, the numbers stop making
                sense, so you stop logging.
              </p>
            </div>
            <div className="problem-row">
              <div className="mark">
                <Wallet size={16} />
              </div>
              <h3>Expert guidance costs too much.</h3>
              <p>
                Real nutrition advice usually means a consultation fee most
                people can't justify every month. Wellness ends up feeling
                like something you graduate into.
              </p>
            </div>
            <div className="problem-row">
              <div className="mark">
                <RefreshCw size={16} />
              </div>
              <h3>Motivation runs out by week two.</h3>
              <p>
                You're excited for a few days, then life happens and the
                streak breaks. Most tools aren't built to catch you when
                that happens. Cherri is.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= APPROACH ================= */}
      <section className="approach-section">
        <div className="wrap approach-grid">
          <div className="approach-visual">
            <Image
              src="/images/approach-prep.jpg"
              alt="Preparing fresh ingredients"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <span className="tag">
              <span className="dot" />
              How we're different
            </span>
            <h2 className="section-title size-l">
              Local flavors meet global data.
            </h2>
            <p className="section-desc">
              Cherri was built from the ground up around African meals,
              African budgets, and African routines, then layered with AI
              sharp enough to keep up with any of it.
            </p>
            <ul className="approach-list">
              <li>
                <span className="check"><Check size={13} /></span>
                Nutrition data built for local dishes, not adapted from
                someone else's plate
              </li>
              <li>
                <span className="check"><Check size={13} /></span>
                AI insights that adjust to your goals, not a generic
                calorie target
              </li>
              <li>
                <span className="check"><Check size={13} /></span>
                Designed to work even when data and budgets are tight
              </li>
              <li>
                <span className="check"><Check size={13} /></span>
                Built for real life, missed days, small wins, and
                everything between
              </li>
              <li>
                <span className="check"><Check size={13} /></span>
                No shame, no lectures, just a clearer picture of what's
                working
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features-section" id="how-it-works">
        <div className="wrap">
          <div className="features-header">
            <span className="tag">
              <span className="dot" />
              Inside the app
            </span>
            <h2 className="section-title size-l">
              Everything you need, none of the noise.
            </h2>
            <p className="section-desc">
              One app for logging, planning, tracking, and understanding, so
              your wellness tools stop living in five different places.
            </p>
          </div>

          <div className="features-layout">
            <div className="feature-hero">
              <svg className="bg-icon" width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#F6F1E4" strokeWidth="0.6" aria-hidden="true">
                <path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2M5 2v20M15 2c-1.7 0-3 3-3 7s1.3 7 3 7 3-3 3-7-1.3-7-3-7zM15 16v6" />
              </svg>
              <div className="icon-badge">
                <Camera size={20} />
              </div>
              <h3>Meal Logging</h3>
              <p>
                Snap it, search it, or speak it. Cherri recognizes local
                dishes and logs them accurately, in seconds.
              </p>
            </div>

            <div className="feature-list">
              <div className="feature-row">
                <div className="icon-badge"><CalendarDays size={17} /></div>
                <div>
                  <h3>Meal Planning</h3>
                  <p>Plans built around your goals, budget, and nearby ingredients.</p>
                </div>
              </div>
              <div className="feature-row">
                <div className="icon-badge"><LineChart size={17} /></div>
                <div>
                  <h3>Body & Progress Tracking</h3>
                  <p>Simple, visual tracking that shows real change over time.</p>
                </div>
              </div>
              <div className="feature-row">
                <div className="icon-badge"><MessageCircle size={17} /></div>
                <div>
                  <h3>Chat & Support</h3>
                  <p>Straight answers, when you need them.</p>
                </div>
              </div>
              <div className="feature-row">
                <div className="icon-badge"><Sparkles size={17} /></div>
                <div>
                  <h3>AI Insights</h3>
                  <p>Patterns that actually move the needle for you.</p>
                </div>
              </div>
              <div className="feature-row">
                <div className="icon-badge"><BookOpen size={17} /></div>
                <div>
                  <h3>Blog & Community</h3>
                  <p>Real conversations, real habits, from people building the same routine.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* ================= VISION & MISSION ================= */}
      <section className="vm-section">
        <div className="wrap">
          <span className="tag">
            <span className="dot" />
            Our purpose
          </span>
          <p className="vm-intro">
            Wellness isn't a luxury, it's a right, built here for the way we
            actually live.
          </p>

          <div className="vm-grid">
            <div className="vm-block">
              <h3>Vision</h3>
              <p>
                To become Africa's most trusted wellness companion, helping
                people take control of their health through tools that
                actually understand their reality.
              </p>
            </div>
            <div className="vm-block">
              <h3>Mission</h3>
              <p>
                We make wellness simple and achievable for every African by
                combining smart technology with nutrition data that reflects
                how people actually eat, wherever they are.
              </p>
              <ul>
                <li>Culturally accurate tracking for local meals</li>
                <li>AI insights that turn data into direction</li>
                <li>Tools designed for real budgets and real routines</li>
                <li>A community that keeps you consistent, not just motivated for a week</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUNDERS ================= */}
      <section className="founders-section">
        <div className="wrap">
          <span className="tag">
            <span className="dot" />
            Leadership
          </span>
          <h2 className="section-title size-l" style={{ marginBottom: 8 }}>
            Meet the founders
          </h2>

          <div className="founder-card">
            <div className="founder-avatars">
              <div className="avatar" style={{ background: 'var(--forest)' }}>JP</div>
              <div className="avatar" style={{ background: 'var(--ember)' }}>AA</div>
            </div>
            <div>
              <h3>Joseph Olamide Peculiar & Adebisi Festus Adeayo</h3>
              <div className="role">Co-Founders</div>
              <p>
                Two builders who got tired of watching wellness apps
                overlook the way people actually eat and live in Nigeria.
                Cherri is their answer, built locally, tested locally,
                made for the long haul.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOG TEASER ================= */}
      <section className="blog-section">
        <div className="wrap">
          <div className="eyebrow-row">
            <div>
              <span className="tag">
                <span className="dot" />
                From the blog
              </span>
              <h2 className="section-title size-l">The wellness hub</h2>
            </div>
            <Link href="/blog" className="btn-secondary">
              Visit blog <ArrowRight size={15} />
            </Link>
          </div>

          <div className="blog-grid">
            {[
              { meta: 'Nutrition', fill: '#4E9F5C' },
              { meta: 'Meal Planning', fill: '#C1362B' },
              { meta: 'Mindset', fill: '#F6F1E4' },
            ].map((card) => (
              <div key={card.meta}>
                <div className="blog-card-img">
                  <svg viewBox="0 0 300 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <circle cx="120" cy="110" r="60" fill={card.fill} opacity="0.9" />
                    <circle cx="200" cy="150" r="60" fill={card.fill} opacity="0.5" />
                  </svg>
                </div>
                <div className="blog-card-meta">{card.meta}</div>
                <h3>New posts coming soon</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY ================= */}
      <section className="community-section">
        <div className="wrap">
          <div className="community-band">
            <div>
              <h3>You don't have to do this alone.</h3>
              <p>
                Swap wins, ask questions, and stay accountable with people
                building the same habits as you.
              </p>
            </div>
            <Link href="/community" className="btn-primary">
              Join the community
            </Link>
          </div>
        </div>
      </section>

      {/* ================= EARLY ACCESS SIGNUP ================= */}
      <section className="signup-section">
        <div className="wrap">
          <div className="signup-grid">
            <div>
              <span className="tag">
                <span className="dot" />
                Early access
              </span>
              <h2 className="section-title size-l">Be first in line.</h2>
              <p className="section-desc">
                Early access members help shape Cherri before launch, and
                get in before everyone else.
              </p>
            </div>
            <form className="signup-form">
              <div>
                <label htmlFor="name">Full name</label>
                <input id="name" type="text" placeholder="Enter your name" />
              </div>
              <div>
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" placeholder="hello@example.com" />
              </div>
              <button type="submit">Join early access</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}