import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import SiteChrome from '../components/SiteChrome'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cherri — Wellness, reimagined for us',
  description:
    'Cherri tracks what you actually eat, including local dishes, and turns it into insights you can use.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
<SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}