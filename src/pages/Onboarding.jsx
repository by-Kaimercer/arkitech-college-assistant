import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useClaudeAPI } from '../hooks/useClaudeAPI'

const CONCERNS = [
  'My grades',
  'No clear spike',
  'Essays',
  "Don't know where to apply",
  'All of the above',
]

const fadeSlide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { updateStudentProfile, setOnboardingComplete, studentProfile } = useAppStore()
  const [localData, setLocalData] = useState({
    name: studentProfile.name || '',
    gradYear: studentProfile.gradYear || '',
    gpa: studentProfile.gpa || '',
    dreamSchools: studentProfile.dreamSchools || ['', '', ''],
    biggestConcern: studentProfile.biggestConcern || '',
  })
  const [assessment, setAssessment] = useState('')

  const { callAPI, isLoading } = useClaudeAPI({
    systemPrompt: `You are the ARCHITECT — a clinical admissions strategist. Given a student's basic profile, provide a brief 3-4 sentence "SITUATION ASSESSMENT" that feels personalized. Be direct, tactical, and identify their single biggest leverage opportunity. Use clinical language. No fluff. No encouragement.`,
    maxTokens: 300,
  })

  const generateAssessment = async () => {
    const prompt = `Student: ${localData.name}
Graduation Year: ${localData.gradYear}
GPA Range: ${localData.gpa}
Dream Schools: ${localData.dreamSchools.filter(Boolean).join(', ')}
Biggest Concern: ${localData.biggestConcern}

Provide a SITUATION ASSESSMENT.`

    const result = await callAPI(prompt, { stream: false })
    if (result) setAssessment(result)
  }

  const handleStep2Complete = async () => {
    updateStudentProfile(localData)
    setStep(2)
    await generateAssessment()
  }

  const enterDashboard = () => {
    updateStudentProfile(localData)
    setOnboardingComplete(true)
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <AnimatePresence mode="wait">
          {/* ── SCREEN 1: WELCOME ── */}
          {step === 0 && (
            <motion.div key="s0" {...fadeSlide} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
                <span className="pulse-dot" />
                <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ ONBOARDING PROTOCOL ]</span>
              </div>

              <h1 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 900,
                fontSize: 'clamp(36px, 6vw, 64px)', color: 'var(--text-primary)',
                lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '24px',
              }}>
                WELCOME TO<br />
                <span style={{ color: 'var(--accent-acid)' }}>ARCHITECT</span>
              </h1>

              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '14px',
                color: 'var(--text-secondary)', lineHeight: 1.8,
                maxWidth: '400px', margin: '0 auto 48px',
              }}>
                This is your admissions operations center. In the next 3 minutes, we'll set up your mission profile.
              </p>

              <button className="btn-primary" onClick={() => setStep(1)} style={{ fontSize: '14px', padding: '16px 32px' }}>
                BEGIN MISSION SETUP <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── SCREEN 2: QUICK FORM ── */}
          {step === 1 && (
            <motion.div key="s1" {...fadeSlide}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ STEP 1 OF 3 — INITIAL INTEL ]</span>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 900,
                fontSize: '28px', color: 'var(--text-primary)',
                marginBottom: '32px', letterSpacing: '-0.02em',
              }}>
                BASIC PROFILE
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <p className="label-tag" style={{ marginBottom: '8px' }}>YOUR NAME</p>
                  <input className="input-dark" placeholder="e.g. Alex Chen" value={localData.name} onChange={(e) => setLocalData({ ...localData, name: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p className="label-tag" style={{ marginBottom: '8px' }}>GRADUATION YEAR</p>
                    <select className="input-dark" value={localData.gradYear} onChange={(e) => setLocalData({ ...localData, gradYear: e.target.value })}>
                      <option value="">— SELECT —</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                  <div>
                    <p className="label-tag" style={{ marginBottom: '8px' }}>CURRENT GPA RANGE</p>
                    <select className="input-dark" value={localData.gpa} onChange={(e) => setLocalData({ ...localData, gpa: e.target.value })}>
                      <option value="">— SELECT —</option>
                      <option value="4.0">4.0</option>
                      <option value="3.7-3.9">3.7 — 3.9</option>
                      <option value="3.0-3.6">3.0 — 3.6</option>
                      <option value="2.0-2.9">2.0 — 2.9</option>
                      <option value="Below 2.0">Below 2.0</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="label-tag" style={{ marginBottom: '8px' }}>TOP 3 DREAM SCHOOLS</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {localData.dreamSchools.map((s, i) => (
                      <input key={i} className="input-dark" placeholder={`Dream school ${i + 1}`} value={s}
                        onChange={(e) => {
                          const arr = [...localData.dreamSchools]
                          arr[i] = e.target.value
                          setLocalData({ ...localData, dreamSchools: arr })
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-tag" style={{ marginBottom: '8px' }}>BIGGEST CONCERN</p>
                  <select className="input-dark" value={localData.biggestConcern} onChange={(e) => setLocalData({ ...localData, biggestConcern: e.target.value })}>
                    <option value="">— SELECT —</option>
                    {CONCERNS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={handleStep2Complete} style={{ width: '100%', justifyContent: 'center', marginTop: '32px', fontSize: '14px', padding: '16px 24px' }}>
                GENERATE SITUATION ASSESSMENT <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── SCREEN 3: AI ASSESSMENT ── */}
          {step === 2 && (
            <motion.div key="s2" {...fadeSlide} style={{ textAlign: 'center' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ STEP 2 OF 3 — SITUATION ASSESSMENT ]</span>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 900,
                fontSize: '28px', color: 'var(--text-primary)',
                marginBottom: '32px', letterSpacing: '-0.02em',
              }}>
                YOUR CURRENT POSITION
              </h2>

              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--bg-border)',
                borderLeft: '3px solid var(--accent-acid)',
                borderRadius: '4px',
                padding: '24px',
                textAlign: 'left',
                marginBottom: '32px',
                minHeight: '100px',
              }}>
                {isLoading ? (
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--accent-acid)', letterSpacing: '0.05em' }}>
                    [ ARCHITECT PROCESSING... ]
                  </p>
                ) : assessment ? (
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                    {assessment}
                  </p>
                ) : (
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    [ GENERATING ASSESSMENT... ]
                  </p>
                )}
              </div>

              <button className="btn-primary" onClick={() => setStep(3)} disabled={isLoading} style={{ fontSize: '14px', padding: '16px 32px', opacity: isLoading ? 0.5 : 1 }}>
                CONTINUE <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── SCREEN 4: ENTER DASHBOARD ── */}
          {step === 3 && (
            <motion.div key="s3" {...fadeSlide} style={{ textAlign: 'center' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ STEP 3 OF 3 — DEPLOYMENT ]</span>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 900,
                fontSize: '28px', color: 'var(--text-primary)',
                marginBottom: '16px', letterSpacing: '-0.02em',
              }}>
                YOUR COMMAND CENTER AWAITS
              </h2>

              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '13px',
                color: 'var(--text-secondary)', lineHeight: 1.8,
                maxWidth: '440px', margin: '0 auto 40px',
              }}>
                Your personalized admissions operations center is ready. Track applications, optimize essays, calculate odds, and execute your strategy — all from one place.
              </p>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--bg-border)',
                borderRadius: '4px',
                padding: '32px',
                marginBottom: '40px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                  {[
                    { label: 'ADMISSIONS RADAR', desc: 'Calculate acceptance odds' },
                    { label: 'ESSAY FORGE', desc: 'AI-powered essay workshop' },
                    { label: 'ACTIVITY OPS', desc: 'Optimize extracurriculars' },
                  ].map((f) => (
                    <div key={f.label} style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--accent-acid)', letterSpacing: '0.1em', marginBottom: '4px' }}>{f.label}</p>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>{f.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '5%' }} />
                </div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '8px', letterSpacing: '0.08em' }}>MISSION PROGRESS: 5%</p>
              </div>

              <button className="btn-primary" onClick={enterDashboard} style={{ fontSize: '16px', padding: '18px 40px' }}>
                → ENTER COMMAND CENTER
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
