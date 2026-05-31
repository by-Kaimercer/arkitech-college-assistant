import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_TASKS = [
  { id: 't1', label: 'Complete your Academic Profile', sub: 'Build your dossier in the profile builder', module: '/dashboard', done: false },
  { id: 't2', label: 'Run Admissions Radar for your top school', sub: 'Get your acceptance probability estimate', module: '/dashboard/radar', done: false },
  { id: 't3', label: 'Draft Personal Statement', sub: 'Start your Common App main essay', module: '/dashboard/essays', done: false },
  { id: 't4', label: 'Optimize 3 Extracurricular Activities', sub: 'Transform descriptions into elite entries', module: '/dashboard/activities', done: false },
  { id: 't5', label: 'Build your College List (aim for 12)', sub: 'Balance Reach / Target / Safety schools', module: '/dashboard/colleges', done: false },
  { id: 't6', label: 'Run SAT Score Predictor', sub: 'Estimate your projected test performance', module: '/dashboard/testprep', done: false },
  { id: 't7', label: 'Estimate Financial Aid for target schools', sub: 'Decode your potential aid packages', module: '/dashboard/financial', done: false },
]

const DAILY_TIPS = [
  "INTEL: Stanford's CS department has admitted 3 students with sub-3.5 GPAs in the last cohort — all had published GitHub projects with 200+ stars.",
  "INTEL: MIT values \"maker culture\" above GPA. Document every project you've built independently — hardware or software.",
  "INTEL: Yale's residential college system means they filter for community contributors, not just achievers. Show depth of local impact.",
  "INTEL: Columbia's Core Curriculum essay is a trap — they want you to engage with specific texts, not describe a love of learning.",
  "INTEL: Early Decision applicants at top 20 schools have 2-3x higher acceptance rates. This is your single largest strategic lever.",
  "INTEL: First-generation college students receive a measurable admissions boost at 85% of top-50 institutions. Leverage this in your narrative.",
  "INTEL: Research publications — even in minor journals — are Category-1 spikes. One published paper outweighs 10 club memberships.",
]

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Onboarding ──
      onboardingComplete: false,
      setOnboardingComplete: (val) => set({ onboardingComplete: val }),

      // ── Student Profile (expanded from ProfileContext) ──
      studentProfile: {
        name: '',
        gradYear: '',
        gpa: '',
        gpaWeighted: '',
        classRank: '',
        courseRigor: [],
        apCourseCount: '',
        schoolType: '',
        country: '',
        strongestSubject: '',
        weakestSubject: '',
        targetUniversity: '',
        targetCourse: '',
        deadline: '',
        reachType: 'REACH',
        spikes: '',
        spikeCategories: [],
        unusualAchievement: '',
        gradeExplanation: '',
        extenuating: false,
        extenuatingDetails: '',
        geographicContext: '',
        satTotal: '',
        satMath: '',
        satEBRW: '',
        actComposite: '',
        testOptional: false,
        intendedMajor: '',
        firstGen: false,
        legacy: false,
        internationalStudent: false,
        underrepresented: false,
        dreamSchools: ['', '', ''],
        biggestConcern: '',
      },
      updateStudentProfile: (updates) =>
        set((s) => ({ studentProfile: { ...s.studentProfile, ...updates } })),

      // ── College List ──
      collegeList: [],
      addCollege: (college) =>
        set((s) => ({
          collegeList: [...s.collegeList, {
            id: Date.now().toString(),
            name: college.name,
            country: college.country || '',
            type: college.type || 'TARGET', // REACH / TARGET / SAFETY
            deadline: college.deadline || '',
            odds: college.odds || null,
            status: 'NOT STARTED',
            priority: s.collegeList.length,
            ...college,
          }],
        })),
      updateCollege: (id, updates) =>
        set((s) => ({
          collegeList: s.collegeList.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeCollege: (id) =>
        set((s) => ({
          collegeList: s.collegeList.filter((c) => c.id !== id),
        })),

      // ── Essays ──
      essays: [],
      addEssay: (essay) =>
        set((s) => ({
          essays: [...s.essays, {
            id: Date.now().toString(),
            type: 'COMMON APP MAIN',
            school: '',
            content: '',
            versions: [],
            scores: null,
            createdAt: new Date().toISOString(),
            ...essay,
          }],
        })),
      updateEssay: (id, updates) =>
        set((s) => ({
          essays: s.essays.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      removeEssay: (id) =>
        set((s) => ({ essays: s.essays.filter((e) => e.id !== id) })),

      // ── Activities ──
      activities: [],
      addActivity: (activity) =>
        set((s) => ({
          activities: [...s.activities, {
            id: Date.now().toString(),
            name: '',
            type: 'TECHNICAL',
            role: '',
            organization: '',
            hoursPerWeek: '',
            weeksPerYear: '',
            yearsActive: [],
            description: '',
            optimizedDescription: '',
            originalScore: null,
            optimizedScore: null,
            ...activity,
          }],
        })),
      updateActivity: (id, updates) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      removeActivity: (id) =>
        set((s) => ({
          activities: s.activities.filter((a) => a.id !== id),
        })),

      // ── Test Scores ──
      testScores: {
        satCurrent: '',
        satTarget: '',
        satStudyHours: 5,
        satTestDate: '',
        actCurrent: '',
        actTarget: '',
        apCourses: [],
      },
      updateTestScores: (updates) =>
        set((s) => ({ testScores: { ...s.testScores, ...updates } })),

      // ── Financial ──
      financialData: {
        householdIncome: 75000,
        familySize: 4,
        hasHomeEquity: false,
        hasSavings: false,
        hasInvestments: false,
        parentMaritalStatus: 'Married',
        studentSavings: '',
        siblingsInCollege: 0,
      },
      updateFinancialData: (updates) =>
        set((s) => ({ financialData: { ...s.financialData, ...updates } })),

      // ── Tasks / Missions ──
      tasks: DEFAULT_TASKS,
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),

      // ── Notifications ──
      notifications: [],
      addNotification: (notification) =>
        set((s) => ({
          notifications: [
            { id: Date.now().toString(), read: false, time: new Date().toISOString(), ...notification },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // ── Session ──
      sessionRestored: false,
      setSessionRestored: (val) => set({ sessionRestored: val }),

      // ── Daily Tip ──
      getDailyTip: () => {
        const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % DAILY_TIPS.length
        return DAILY_TIPS[dayIndex]
      },

      // ── Computed Values ──
      getProfileLeverageScore: () => {
        const s = get()
        let score = 0
        const p = s.studentProfile
        if (p.name) score += 5
        if (p.gpa) score += 10
        if (p.targetUniversity) score += 10
        if (p.targetCourse) score += 5
        if (p.spikeCategories.length > 0) score += 10
        if (p.unusualAchievement) score += 10
        if (s.collegeList.length > 0) score += 10
        if (s.essays.length > 0) score += 10
        if (s.activities.length > 0) score += 10
        if (p.satTotal || p.actComposite) score += 10
        if (s.collegeList.length >= 8) score += 10
        return Math.min(score, 100)
      },

      getMissionProgress: () => {
        const s = get()
        const completed = s.tasks.filter((t) => t.done).length
        return Math.round((completed / s.tasks.length) * 100)
      },

      getDaysToDeadline: () => {
        const s = get()
        const deadlines = s.collegeList
          .filter((c) => c.deadline)
          .map((c) => new Date(c.deadline).getTime())
        if (deadlines.length === 0) return null
        const earliest = Math.min(...deadlines)
        const days = Math.ceil((earliest - Date.now()) / (1000 * 60 * 60 * 24))
        return Math.max(0, days)
      },
    }),
    {
      name: 'architect-app-storage',
      version: 1,
    }
  )
)
