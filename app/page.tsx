'use client'

import Hero from '@/components/Hero/Hero'
import IntroSection from '@/components/Sections/IntroSection'
import HousesSection from '@/components/Sections/HousesSection'
import ProfilesSection from '@/components/Sections/ProfilesSection'
import LandscapeSection from '@/components/Sections/LandscapeSection'
import MagazineSection from '@/components/Sections/MagazineSection'
import SchoolSection from '@/components/Sections/SchoolSection'
import Footer from '@/components/Sections/Footer'
import WavyLineDividerAdvanced from '@/components/Hero/Wavylinedivideradvanced'
import LoadingScreen from '@/components/UI/LoadingScreen'
import '@/styles/globals.css'

export default function HomePage() {
  return (
    <main className="bg-[#F5F1E8]">
      {/* <LoadingScreen /> */}
      <Hero />
      <IntroSection />
      <HousesSection />
      <ProfilesSection />
      {/* <LandscapeSection /> */}
      <MagazineSection />
      <SchoolSection />
      <Footer />
    </main>
  )
}