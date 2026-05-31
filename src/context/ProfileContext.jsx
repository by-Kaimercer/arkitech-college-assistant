import { createContext, useContext, useState } from 'react'

const ProfileContext = createContext(null)

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    // Step 1 - Academic
    gpa: '',
    schoolType: '',
    country: '',
    strongestSubject: '',
    weakestSubject: '',
    // Step 2 - Target
    targetUniversity: '',
    targetCourse: '',
    deadline: '',
    reachType: 'REACH',
    // Step 3 - Spikes
    spikes: '',
    spikeCategories: [],
    unusualAchievement: '',
    // Step 4 - Context
    gradeExplanation: '',
    extenuating: false,
    extenuatingDetails: '',
    geographicContext: '',
  })

  const updateProfile = (updates) => setProfile(prev => ({ ...prev, ...updates }))

  const getDossierText = () => {
    const cats = profile.spikeCategories.join(', ') || 'None specified'
    return `STUDENT DOSSIER BRIEF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACADEMIC PROFILE:
  GPA/Grade Level: ${profile.gpa || 'Not specified'}
  School Type: ${profile.schoolType || 'Not specified'}
  Country/Education System: ${profile.country || 'Not specified'}
  Strongest Subject: ${profile.strongestSubject || 'Not specified'}
  Weakest Subject: ${profile.weakestSubject || 'Not specified'}

TARGET INTELLIGENCE:
  Target University: ${profile.targetUniversity || 'Not specified'}
  Target Course/Major: ${profile.targetCourse || 'Not specified'}
  Application Deadline: ${profile.deadline || 'Not specified'}
  Application Type: ${profile.reachType}

SPIKE IDENTIFICATION:
  Categories: ${cats}
  Unconventional Assets: ${profile.spikes || 'Not specified'}
  Most Unusual Achievement: ${profile.unusualAchievement || 'Not specified'}

CONTEXT FACTORS:
  Grade Explanation: ${profile.gradeExplanation || 'Not specified'}
  Extenuating Circumstances: ${profile.extenuating ? profile.extenuatingDetails || 'Yes (no details)' : 'None'}
  Geographic Context: ${profile.geographicContext || 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Proceed with Phase 01 analysis for the target institution.`
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, getDossierText }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
