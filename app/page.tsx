'use client'

import Hero from '@/components/Hero/Hero'
import IntroSection from '@/components/Sections/IntroSection'
import HousesSection from '@/components/Sections/HousesSection'
import ProfilesSection from '@/components/Sections/ProfilesSection'
import MagazineSection from '@/components/Sections/MagazineSection'
import RandomMessageSection from '@/components/Sections/RandomMessageSection'
import SchoolSection from '@/components/Sections/SchoolSection'
import Footer from '@/components/Sections/Footer'
import '@/styles/globals.css'

export default function HomePage() {
  return (
    <main className="bg-[#F5F1E8]">
      <Hero />
      <HousesSection />
      <IntroSection />
      <ProfilesSection />
      <MagazineSection />
      <RandomMessageSection />
      <SchoolSection />
      <Footer />
    </main>
  )
}