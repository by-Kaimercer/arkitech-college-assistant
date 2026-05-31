import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ProfileProvider } from '../context/ProfileContext'
import LoadingScreen from '../components/LoadingScreen'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import ArchitectChat from '../components/ArchitectChat'
import ProfileBuilder from '../components/ProfileBuilder'
import UniversityIntel from '../components/UniversityIntel'
import EssayWorkshop from '../components/EssayWorkshop'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'

export default function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [dossierContext, setDossierContext] = useState(null)

  const handleTarget = (uni) => {
    // Pre-fill profile builder with the target university
  }

  return (
    <ProfileProvider>
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        ) : (
          <div key="app">
            <Navbar />
            <main>
              <Hero />
              <HowItWorks />
              <ArchitectChat dossierContext={dossierContext} />
              <ProfileBuilder onDeploy={(dossier) => setDossierContext(dossier)} />
              <UniversityIntel onTarget={handleTarget} />
              <EssayWorkshop />
              <Testimonials />
              <Pricing />
            </main>
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </ProfileProvider>
  )
}
