'use client'

import Hero from '@/components/Hero/Hero'
import IntroSection from '@/components/Sections/IntroSection'
import JourneyTimeline from '@/components/Sections/JourneyTimeline'
import HousesSection from '@/components/Sections/HousesSection'
import SeasonalJourneys from '@/components/Sections/SeasonalJourneys'
import JapanMap from '@/components/Sections/JapanMap'
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
    <main className="bg-paper dark:bg-midnight">
      {/* <LoadingScreen /> */}
      <Hero />
      <IntroSection />
      <JourneyTimeline />
      <HousesSection />
      <SeasonalJourneys />
      <JapanMap />
      <ProfilesSection />
      {/* <LandscapeSection /> */}
      <MagazineSection />
      <SchoolSection />
      <Footer />
    </main>
  )
}