'use client'
import { usePathname } from 'next/navigation'
import NavBar from './NavBar'
import Footer from './Footer'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome = pathname?.startsWith('/onboarding')

  return (
    <>
      {!hideChrome && <NavBar />}
      {children}
      {!hideChrome && <Footer />}
    </>
  )
}