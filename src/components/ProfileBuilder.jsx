import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

const SPIKE_CATEGORIES = [
  'RESEARCH', 'ENTREPRENEURSHIP', 'ATHLETICS', 'ARTS', 'CODING',
  'SOCIAL IMPACT', 'CONTENT CREATION', 'COMPETITION WINNER',
  'NICHE EXPERTISE', 'SELF-TAUGHT', 'PUBLISHED WORK', 'WORK EXPERIENCE',
]

const REACH_OPTIONS = ['REACH', 'STRETCH', 'MATCH']
const GPA_OPTIONS = ['A* / 4.0 GPA', 'A / 3.7-3.9 GPA', 'B / 3.0-3.6 GPA', 'C / 2.0-2.9 GPA', 'D / Below 2.0', 'Not Applicable']
const SCHOOL_TYPES = ['State / Public School', 'Private School', 'International School', 'Grammar School', 'Home School', 'College / Sixth Form', 'Other']
const GEOGRAPHIC_OPTIONS = ['United Kingdom', 'United States', 'India', 'Canada', 'Australia', 'Germany', 'Singapore', 'UAE', 'Other']
const STEP_LABELS = ['ACADEMIC PROFILE', 'TARGET INTELLIGENCE', 'SPIKE IDENTIFICATION', 'CONTEXT FACTORS', 'DEPLOY']

function Field({ label, children }) {
  return (
    <div>
      <p className="label-tag" style={{ marginBottom: '8px' }}>{label}</p>
      {children}
    </div>
  )
}

export default function ProfileBuilder({ onDeploy }) {
  const { profile, updateProfile, getDossierText } = useProfile()
  const [step, setStep] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const toggleCategory = (cat) => {
    const cats = profile.spikeCategories || []
    updateProfile({
      spikeCategories: cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat]
    })
  }

  const handleDeploy = () => {
    onDeploy(getDossierText())
    setTimeout(() => {
      document.querySelector('#architect-chat')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const progress = (step / 4) * 100

  return (
    <section id="profile-builder" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ INTELLIGENCE GATHERING ]</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', marginTop: '8px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            BUILD YOUR DOSSIER
          </h2>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.7 }}>
            The Architect needs raw intelligence before deploying strategy. Complete your profile to unlock Phase-specific recommendations.
          </p>
        </motion.div>

        <div className="progress-bar" style={{ marginBottom: '8px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--accent-acid)', letterSpacing: '0.1em' }}>
            STEP {step + 1} OF 5 — {STEP_LABELS[step]}
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
            {Math.round(progress)}% COMPLETE
          </span>
        </div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Field label="GPA / GRADE LEVEL">
                  <select className="input-dark" value={profile.gpa} onChange={e => updateProfile({ gpa: e.target.value })}>
                    <option value="">— SELECT —</option>
                    {GPA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="SCHOOL TYPE">
                  <select className="input-dark" value={profile.schoolType} onChange={e => updateProfile({ schoolType: e.target.value })}>
                    <option value="">— SELECT —</option>
                    {SCHOOL_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="COUNTRY / EDUCATION SYSTEM">
                  <input className="input-dark" placeholder="e.g. United Kingdom — A-Levels" value={profile.country} onChange={e => updateProfile({ country: e.target.value })} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="STRONGEST SUBJECT">
                    <input className="input-dark" placeholder="e.g. Mathematics" value={profile.strongestSubject} onChange={e => updateProfile({ strongestSubject: e.target.value })} />
                  </Field>
                  <Field label="WEAKEST SUBJECT">
                    <input className="input-dark" placeholder="e.g. Chemistry" value={profile.weakestSubject} onChange={e => updateProfile({ weakestSubject: e.target.value })} />
                  </Field>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Field label="TARGET UNIVERSITY">
                  <input className="input-dark" placeholder="e.g. University of Oxford" value={profile.targetUniversity} onChange={e => updateProfile({ targetUniversity: e.target.value })} />
                </Field>
                <Field label="TARGET COURSE / MAJOR">
                  <input className="input-dark" placeholder="e.g. Computer Science" value={profile.targetCourse} onChange={e => updateProfile({ targetCourse: e.target.value })} />
                </Field>
                <Field label="APPLICATION DEADLINE">
                  <input type="date" className="input-dark" value={profile.deadline} onChange={e => updateProfile({ deadline: e.target.value })} style={{ colorScheme: 'dark' }} />
                </Field>
                <Field label="APPLICATION TYPE">
                  <div className="toggle-group">
                    {REACH_OPTIONS.map(opt => (
                      <div key={opt} className={`toggle-option ${profile.reachType === opt ? 'active' : ''}`} onClick={() => updateProfile({ reachType: opt })}>{opt}</div>
                    ))}
                  </div>
                </Field>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Field label="UNCONVENTIONAL ASSETS">
                  <textarea className="input-dark" rows={3} placeholder="Describe activities, projects, skills, experiences..." value={profile.spikes} onChange={e => updateProfile({ spikes: e.target.value })} style={{ resize: 'vertical', lineHeight: 1.7 }} />
                </Field>
                <div>
                  <p className="label-tag" style={{ marginBottom: '12px' }}>SPIKE CATEGORIES — SELECT ALL THAT APPLY</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SPIKE_CATEGORIES.map(cat => (
                      <div key={cat} className={`checkbox-chip ${profile.spikeCategories?.includes(cat) ? 'selected' : ''}`} onClick={() => toggleCategory(cat)}>{cat}</div>
                    ))}
                  </div>
                </div>
                <Field label="MOST UNUSUAL ACHIEVEMENT">
                  <input className="input-dark" placeholder="The one thing that has no obvious category..." value={profile.unusualAchievement} onChange={e => updateProfile({ unusualAchievement: e.target.value })} />
                </Field>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Field label="WHY MIGHT YOUR GRADES NOT REFLECT YOUR ABILITY?">
                  <textarea className="input-dark" rows={4} placeholder="Be clinical. The Architect will reframe this strategically." value={profile.gradeExplanation} onChange={e => updateProfile({ gradeExplanation: e.target.value })} style={{ resize: 'vertical', lineHeight: 1.7 }} />
                </Field>
                <Field label="EXTENUATING CIRCUMSTANCES?">
                  <div className="toggle-group" style={{ width: 'fit-content' }}>
                    {['YES', 'NO'].map(opt => (
                      <div key={opt} className={`toggle-option ${(profile.extenuating ? 'YES' : 'NO') === opt ? 'active' : ''}`} onClick={() => updateProfile({ extenuating: opt === 'YES' })}>{opt}</div>
                    ))}
                  </div>
                  {profile.extenuating && (
                    <textarea className="input-dark" rows={3} placeholder="Briefly describe..." value={profile.extenuatingDetails} onChange={e => updateProfile({ extenuatingDetails: e.target.value })} style={{ resize: 'vertical', lineHeight: 1.7, marginTop: '12px' }} />
                  )}
                </Field>
                <Field label="GEOGRAPHIC CONTEXT">
                  <select className="input-dark" value={profile.geographicContext} onChange={e => updateProfile({ geographicContext: e.target.value })}>
                    <option value="">— SELECT REGION —</option>
                    {GEOGRAPHIC_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <p className="label-tag" style={{ color: 'var(--accent-acid)', marginBottom: '20px' }}>DOSSIER BRIEF — REVIEW BEFORE DEPLOYMENT</p>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
                  {[
                    ['GPA / GRADE', profile.gpa || '—'],
                    ['SCHOOL TYPE', profile.schoolType || '—'],
                    ['COUNTRY', profile.country || '—'],
                    ['TARGET UNIVERSITY', profile.targetUniversity || '—'],
                    ['TARGET COURSE', profile.targetCourse || '—'],
                    ['APPLICATION TYPE', profile.reachType],
                    ['SPIKE CATEGORIES', profile.spikeCategories?.join(', ') || '—'],
                    ['UNUSUAL ACHIEVEMENT', profile.unusualAchievement || '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="dossier-row">
                      <span className="label-tag">{label}</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)', textAlign: 'right', maxWidth: '55%' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={handleDeploy} style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '16px 24px' }}>
                  → DEPLOY TO ARCHITECT
                </button>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '16px', letterSpacing: '0.08em' }}>
                  [ PROFILE SAVED LOCALLY — NO DATA STORED ON SERVERS ]
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--bg-border)' }}>
              <button className="btn-dark" onClick={back} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
                <ChevronLeft size={14} /> BACK
              </button>
              <button className="btn-primary" onClick={next}>
                NEXT PHASE <ChevronRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
