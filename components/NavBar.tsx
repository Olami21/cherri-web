'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/tools', label: 'Tools' },
  { href: '/blog', label: 'Blog' },
  { href: '/community', label: 'Community' },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  return (
    <>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <Link href="/" className="nav-mark" aria-label="Cherri home">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
              <circle cx="12" cy="18" r="7" fill="var(--forest)" />
              <circle cx="19" cy="19" r="7" fill="var(--ember)" />
              <path d="M15 10 C15 5, 18 3, 20 2" stroke="var(--forest)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
            <span>Cherri</span>
          </Link>

          <nav className="nav-links">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/signup" className="btn-primary nav-cta">
            Join early access
          </Link>

          <button
            className="nav-toggle"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu-overlay ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        <button
          className="mobile-menu-close"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <X size={26} />
        </button>
        <nav className="mobile-menu-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/signup" className="btn-primary" onClick={() => setMenuOpen(false)}>
          Join early access
        </Link>
      </div>
    </>
  )
}