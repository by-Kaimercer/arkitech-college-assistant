import { useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import DashboardLayout from './components/dashboard/DashboardLayout'
import CommandCenter from './components/dashboard/CommandCenter'
import AdmissionsRadar from './components/dashboard/AdmissionsRadar'
import EssayForge from './components/dashboard/EssayForge'
import ActivityOps from './components/dashboard/ActivityOps'
import CollegeList from './components/dashboard/CollegeList'
import TestPrep from './components/dashboard/TestPrep'
import FinancialIntel from './components/dashboard/FinancialIntel'
import InterviewPrep from './components/dashboard/InterviewPrep'
import DashboardChat from './components/dashboard/DashboardChat'
import DashboardIntel from './components/dashboard/DashboardIntel'
import { useAppStore } from './store/useAppStore'

function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return <div ref={cursorRef} className="custom-cursor" />
}

function SessionToast() {
  const { sessionRestored, setSessionRestored, onboardingComplete } = useAppStore()

  useEffect(() => {
    if (onboardingComplete && !sessionRestored) {
      setSessionRestored(true)
    }
  }, [])

  if (!onboardingComplete || sessionRestored) return null

  return null
}

function App() {
  return (
    <>
      <CustomCursor />
      <BrowserRouter>
        <SessionToast />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<CommandCenter />} />
            <Route path="radar" element={<AdmissionsRadar />} />
            <Route path="essays" element={<EssayForge />} />
            <Route path="activities" element={<ActivityOps />} />
            <Route path="colleges" element={<CollegeList />} />
            <Route path="testprep" element={<TestPrep />} />
            <Route path="financial" element={<FinancialIntel />} />
            <Route path="interview" element={<InterviewPrep />} />
            <Route path="architect" element={<DashboardChat />} />
            <Route path="intel" element={<DashboardIntel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
