import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const RADAR_SYSTEM = `You are the ARCHITECT Admissions Radar — a statistical modeling system for university admissions probability.

Given a student profile and target school, analyze the student's chances and return ONLY valid JSON in this exact format:
{
  "acceptance_probability": 23,
  "probability_range": {"low": 15, "high": 31},
  "factor_scores": {
    "academic_strength": {"score": 7.2, "label": "ABOVE AVG", "status": "+"},
    "test_scores": {"score": 6.0, "label": "BORDERLINE", "status": "~"},
    "extracurricular_depth": {"score": 5.5, "label": "WEAK AREA", "status": "-"},
    "institutional_fit": {"score": 7.8, "label": "STRONG", "status": "+"},
    "essay_potential": {"score": 0, "label": "NOT SCORED", "status": "?"},
    "hooks_unique": {"score": 0, "label": "NOT SCORED", "status": "?"}
  },
  "architect_verdict": "Strategic analysis paragraph here.",
  "improvement_levers": [
    {"action": "If you raise SAT by 80pts", "revised_probability": 34},
    {"action": "If you add research project", "revised_probability": 28},
    {"action": "If you apply ED", "revised_probability": 41}
  ]
}

Base your analysis on publicly available admissions data, acceptance rates, and common admissions factors. Be realistic but strategic. The verdict should be 3-4 sentences of tactical advice.`

const CLASS_RANKS = ['Top 1%', 'Top 5%', 'Top 10%', 'Top 25%', 'Not Ranked']
const RIGOR_OPTIONS = ['AP', 'IB', 'Honors', 'Dual Enrollment', 'None']
const REGIONS = ['Northeast US', 'Southeast US', 'Midwest US', 'West Coast US', 'International — Asia', 'International — Europe', 'International — Other']

function RadarSweep() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-border)" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="var(--bg-border)" strokeWidth="1" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="var(--bg-border)" strokeWidth="1" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="var(--bg-border)" strokeWidth="0.5" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="var(--bg-border)" strokeWidth="0.5" />
        <motion.line
          x1="100" y1="100" x2="100" y2="10"
          stroke="var(--accent-acid)" strokeWidth="2"
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <circle cx="100" cy="100" r="3" fill="var(--accent-acid)" />
      </svg>
      <p style={{
        position: 'absolute',
        fontFamily: 'Space Mono, monospace', fontSize: '10px',
        color: 'var(--accent-acid)', letterSpacing: '0.1em', marginTop: '240px',
      }}>
        [ ARCHITECT PROCESSING... ]
      </p>
    </div>
  )
}

function GaugeArc({ probability, schoolName }) {
  const size = 220
  const r = 95
  const circumference = 2 * Math.PI * r
  const offset = circumference - (probability / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-border)" strokeWidth="4" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="var(--accent-acid)" strokeWidth="4" strokeLinecap="butt"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.span
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '56px', color: 'var(--accent-acid)', lineHeight: 1 }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
          >
            {probability}%
          </motion.span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{schoolName}</span>
        </div>
      </div>
    </div>
  )
}

export default function AdmissionsRadar() {
  const { studentProfile } = useAppStore()
  const { callAPI, isLoading } = useClaudeAPI({ systemPrompt: RADAR_SYSTEM, maxTokens: 2000 })

  const [form, setForm] = useState({
    gpaUnweighted: studentProfile.gpa || '',
    gpaWeighted: studentProfile.gpaWeighted || '',
    classRank: '',
    courseRigor: [],
    apCount: '',
    satTotal: studentProfile.satTotal || '',
    satMath: studentProfile.satMath || '',
    satEBRW: studentProfile.satEBRW || '',
    actComposite: '',
    testOptional: false,
    ecCount: '5',
    leadership: false,
    nationalAchievement: false,
    research: false,
    founded: false,
    athletic: false,
    intendedMajor: studentProfile.intendedMajor || studentProfile.targetCourse || '',
    firstGen: studentProfile.firstGen || false,
    legacy: false,
    region: '',
    international: studentProfile.internationalStudent || false,
    underrepresented: false,
    targetSchool: studentProfile.targetUniversity || '',
  })

  const [results, setResults] = useState(null)

  const updateField = (key, value) => setForm((p) => ({ ...p, [key]: value }))
  const toggleRigor = (opt) => {
    setForm((p) => ({
      ...p,
      courseRigor: p.courseRigor.includes(opt)
        ? p.courseRigor.filter((x) => x !== opt)
        : [...p.courseRigor, opt],
    }))
  }

  const runAnalysis = async () => {
    if (!form.targetSchool) return
    const prompt = `Student Profile:
GPA (unweighted): ${form.gpaUnweighted || 'Not provided'}
GPA (weighted): ${form.gpaWeighted || 'Not provided'}
Class Rank: ${form.classRank || 'Not provided'}
Course Rigor: ${form.courseRigor.join(', ') || 'Not specified'}
AP/IB Courses: ${form.apCount || 'Not specified'}
SAT Total: ${form.testOptional ? 'Test Optional' : form.satTotal || 'Not provided'}
ACT Composite: ${form.testOptional ? 'Test Optional' : form.actComposite || 'Not provided'}
Significant ECs: ${form.ecCount}
Leadership: ${form.leadership ? 'Yes' : 'No'}
National Achievement: ${form.nationalAchievement ? 'Yes' : 'No'}
Research/Publication: ${form.research ? 'Yes' : 'No'}
Founded Organization: ${form.founded ? 'Yes' : 'No'}
Athletic Recruit: ${form.athletic ? 'Yes' : 'No'}
Intended Major: ${form.intendedMajor || 'Undeclared'}
First Gen: ${form.firstGen ? 'Yes' : 'No'}
Legacy: ${form.legacy ? 'Yes' : 'No'}
Region: ${form.region || 'Not specified'}
International: ${form.international ? 'Yes' : 'No'}

TARGET SCHOOL: ${form.targetSchool}

Return the JSON analysis.`

    const data = await callAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') {
      setResults(data)
    } else if (typeof data === 'string') {
      try { setResults(JSON.parse(data)) } catch { /* ignore */ }
    }
  }

  const factorLabels = {
    academic_strength: 'ACADEMIC STRENGTH',
    test_scores: 'TEST SCORES',
    extracurricular_depth: 'EXTRACURRICULAR DEPTH',
    essay_potential: 'ESSAY POTENTIAL',
    institutional_fit: 'INSTITUTIONAL FIT',
    hooks_unique: 'HOOKS / UNIQUE FACTOR',
  }

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '32px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ ADMISSIONS RADAR — STATISTICAL MODELING ]</span>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 900,
          fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)',
          marginTop: '4px', letterSpacing: '-0.02em',
        }}>
          CALCULATE YOUR ODDS
        </h1>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>
        {/* LEFT: Input Form */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '20px' }}>[ STUDENT PROFILE INPUT ]</span>

          {/* Academic */}
          <p className="label-tag" style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>ACADEMIC INPUTS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>GPA (UNWEIGHTED)</p>
              <input className="input-dark" type="number" step="0.1" min="0" max="4" placeholder="0.0 — 4.0" value={form.gpaUnweighted} onChange={(e) => updateField('gpaUnweighted', e.target.value)} />
            </div>
            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>GPA (WEIGHTED)</p>
              <input className="input-dark" type="number" step="0.1" min="0" max="5" placeholder="0.0 — 5.0" value={form.gpaWeighted} onChange={(e) => updateField('gpaWeighted', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <p className="label-tag" style={{ marginBottom: '4px' }}>CLASS RANK</p>
            <select className="input-dark" value={form.classRank} onChange={(e) => updateField('classRank', e.target.value)}>
              <option value="">— SELECT —</option>
              {CLASS_RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <p className="label-tag" style={{ marginBottom: '4px' }}>COURSE RIGOR</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {RIGOR_OPTIONS.map((opt) => (
                <div key={opt} className={`checkbox-chip ${form.courseRigor.includes(opt) ? 'selected' : ''}`} onClick={() => toggleRigor(opt)}>{opt}</div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p className="label-tag" style={{ marginBottom: '4px' }}>NUMBER OF AP/IB COURSES</p>
            <input className="input-dark" type="number" min="0" max="20" value={form.apCount} onChange={(e) => updateField('apCount', e.target.value)} />
          </div>

          {/* Test Scores */}
          <p className="label-tag" style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>TEST SCORES</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span className="label-tag" style={{ fontSize: '9px' }}>TEST OPTIONAL</span>
            <div className="toggle-group" style={{ width: 'fit-content' }}>
              {['NO', 'YES'].map((opt) => (
                <div key={opt} className={`toggle-option ${(form.testOptional ? 'YES' : 'NO') === opt ? 'active' : ''}`}
                  onClick={() => updateField('testOptional', opt === 'YES')}>{opt}</div>
              ))}
            </div>
          </div>

          {!form.testOptional && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', opacity: form.testOptional ? 0.3 : 1 }}>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>SAT TOTAL</p>
                <input className="input-dark" type="number" min="400" max="1600" placeholder="400-1600" value={form.satTotal} onChange={(e) => updateField('satTotal', e.target.value)} />
              </div>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>SAT MATH</p>
                <input className="input-dark" type="number" min="200" max="800" value={form.satMath} onChange={(e) => updateField('satMath', e.target.value)} />
              </div>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>SAT EBRW</p>
                <input className="input-dark" type="number" min="200" max="800" value={form.satEBRW} onChange={(e) => updateField('satEBRW', e.target.value)} />
              </div>
            </div>
          )}

          {/* Extracurriculars */}
          <p className="label-tag" style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>EXTRACURRICULARS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              ['leadership', 'LEADERSHIP POSITIONS'],
              ['nationalAchievement', 'NATIONAL-LEVEL ACHIEVEMENT'],
              ['research', 'RESEARCH / PUBLICATION'],
              ['founded', 'FOUNDED ORG / STARTUP'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={`checkbox-chip ${form[key] ? 'selected' : ''}`} onClick={() => updateField(key, !form[key])} style={{ flex: 1, textAlign: 'center' }}>
                  {form[key] ? '✓ ' : ''}{label}
                </div>
              </div>
            ))}
          </div>

          {/* Context */}
          <p className="label-tag" style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>DEMOGRAPHIC / CONTEXT</p>
          <div style={{ marginBottom: '12px' }}>
            <p className="label-tag" style={{ marginBottom: '4px' }}>INTENDED MAJOR</p>
            <input className="input-dark" placeholder="e.g. Computer Science" value={form.intendedMajor} onChange={(e) => updateField('intendedMajor', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[
              ['firstGen', 'FIRST GEN'],
              ['legacy', 'LEGACY'],
              ['international', 'INTERNATIONAL'],
              ['underrepresented', 'URM'],
            ].map(([key, label]) => (
              <div key={key} className={`checkbox-chip ${form[key] ? 'selected' : ''}`} onClick={() => updateField(key, !form[key])} style={{ textAlign: 'center' }}>
                {form[key] ? '✓ ' : ''}{label}
              </div>
            ))}
          </div>

          {/* Target School */}
          <p className="label-tag" style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>TARGET SCHOOL</p>
          <input className="input-dark" placeholder="e.g. Harvard University" value={form.targetSchool} onChange={(e) => updateField('targetSchool', e.target.value)} style={{ marginBottom: '20px' }} />

          <button className="btn-primary" onClick={runAnalysis} disabled={isLoading || !form.targetSchool}
            style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '14px', opacity: form.targetSchool ? 1 : 0.5 }}>
            {isLoading ? '[ ARCHITECT PROCESSING... ]' : '→ RUN RADAR ANALYSIS'}
          </button>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '8px', letterSpacing: '0.05em' }}>
            [ STATISTICAL MODEL — NOT AN OFFICIAL PREDICTION. FOR STRATEGIC PLANNING ONLY. ]
          </p>
        </div>

        {/* RIGHT: Results */}
        <div style={{ background: 'var(--bg-void)', padding: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
          {isLoading ? (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <RadarSweep />
            </div>
          ) : results ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {/* Gauge */}
              <GaugeArc probability={results.acceptance_probability} schoolName={form.targetSchool} />
              {results.probability_range && (
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 12px', border: '1px solid var(--bg-border)', borderRadius: '2px' }}>
                    [ {results.probability_range.low}% — {results.probability_range.high}% ] ESTIMATED RANGE
                  </span>
                </div>
              )}

              {/* Factor Breakdown */}
              <div style={{ marginBottom: '24px' }}>
                <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ FACTOR BREAKDOWN ]</span>
                {results.factor_scores && Object.entries(results.factor_scores).map(([key, val]) => {
                  const data = typeof val === 'object' ? val : { score: val, label: '', status: '~' }
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--bg-border)' }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.08em', width: '160px', flexShrink: 0 }}>
                        {factorLabels[key] || key.toUpperCase().replace(/_/g, ' ')}
                      </span>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-elevated)', position: 'relative' }}>
                        <motion.div
                          style={{ height: '100%', background: 'var(--accent-acid)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.score / 10) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-primary)', width: '60px', textAlign: 'right' }}>
                        {data.score > 0 ? `${data.score} / 10` : 'N/A'}
                      </span>
                      <span style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '8px', padding: '2px 6px', borderRadius: '2px',
                        color: data.status === '+' ? '#34c759' : data.status === '-' ? '#ff3b30' : '#f5a623',
                        border: `1px solid ${data.status === '+' ? '#34c759' : data.status === '-' ? '#ff3b30' : '#f5a623'}`,
                        letterSpacing: '0.05em',
                      }}>
                        {data.status === '+' ? '+ ' : data.status === '-' ? '- ' : '~ '}{data.label || ''}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Verdict */}
              {results.architect_verdict && (
                <div style={{
                  background: 'var(--bg-elevated)', borderLeft: '3px solid var(--accent-acid)',
                  borderRadius: '4px', padding: '16px', marginBottom: '24px',
                }}>
                  <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ ARCHITECT VERDICT ]</span>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {results.architect_verdict}
                  </p>
                </div>
              )}

              {/* Improvement Levers */}
              {results.improvement_levers && (
                <div>
                  <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ IMPROVEMENT LEVERS ]</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                    {results.improvement_levers.map((lever, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
                        borderRadius: '4px', padding: '16px', textAlign: 'center',
                      }}>
                        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                          {lever.action}
                        </p>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', color: 'var(--accent-acid)' }}>
                          → {lever.revised_probability}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed var(--bg-border)', borderRadius: '4px', minHeight: '300px',
            }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                [ AWAITING ANALYSIS — INPUT PROFILE AND RUN RADAR ]
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #radar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
