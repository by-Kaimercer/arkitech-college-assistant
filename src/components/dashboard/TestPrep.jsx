import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const PREDICT_SYSTEM = `You are the ARCHITECT Test Score Predictor. Given current scores and study plans, predict score improvement.

Return ONLY valid JSON:
{
  "projected_low": 1340,
  "projected_high": 1390,
  "current_percentile": 72,
  "projected_percentile": 91,
  "weekly_projections": [1280, 1300, 1320, 1340, 1360, 1380, 1390],
  "critical_gaps": [
    {"area": "Evidence-Based Reading", "deficit": 40, "priority": "HIGH"}
  ],
  "study_tips": ["Tip 1", "Tip 2", "Tip 3"]
}`

const AP_COURSES_LIST = [
  'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP Physics 1', 'AP Physics 2',
  'AP Physics C: Mechanics', 'AP Chemistry', 'AP Biology', 'AP Environmental Science',
  'AP Computer Science A', 'AP Computer Science Principles',
  'AP English Language', 'AP English Literature', 'AP US History', 'AP World History',
  'AP European History', 'AP Government', 'AP Macroeconomics', 'AP Microeconomics',
  'AP Psychology', 'AP Spanish', 'AP French', 'AP Art History',
]

function ScoreGraph({ projections, target, current }) {
  if (!projections || projections.length === 0) return null
  const width = 400
  const height = 150
  const padding = 30
  const maxVal = Math.max(target, ...projections) + 50
  const minVal = Math.min(current, ...projections) - 50

  const xStep = (width - padding * 2) / (projections.length - 1)
  const yScale = (val) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2)

  const points = projections.map((v, i) => `${padding + i * xStep},${yScale(v)}`).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '400px' }}>
      {/* Target line */}
      <line x1={padding} y1={yScale(target)} x2={width - padding} y2={yScale(target)}
        stroke="var(--accent-acid)" strokeWidth="1" strokeDasharray="4 4" />
      <text x={width - padding + 4} y={yScale(target) + 3}
        style={{ fontFamily: 'Space Mono', fontSize: '8px', fill: 'var(--accent-acid)' }}>
        TARGET
      </text>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const val = minVal + frac * (maxVal - minVal)
        return (
          <line key={frac} x1={padding} y1={yScale(val)} x2={width - padding} y2={yScale(val)}
            stroke="var(--bg-border)" strokeWidth="0.5" />
        )
      })}

      {/* Data line */}
      <motion.polyline points={points} fill="none" stroke="var(--accent-acid)" strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }} />

      {/* Dots */}
      {projections.map((v, i) => (
        <circle key={i} cx={padding + i * xStep} cy={yScale(v)} r="3" fill="var(--accent-acid)" />
      ))}

      {/* Week labels */}
      {projections.map((_, i) => (
        <text key={i} x={padding + i * xStep} y={height - 5} textAnchor="middle"
          style={{ fontFamily: 'Space Mono', fontSize: '7px', fill: 'var(--text-tertiary)' }}>
          W{i + 1}
        </text>
      ))}
    </svg>
  )
}

export default function TestPrep() {
  const { testScores, updateTestScores, collegeList } = useAppStore()
  const { callAPI, isLoading } = useClaudeAPI({ systemPrompt: PREDICT_SYSTEM, maxTokens: 1500 })
  const [tab, setTab] = useState('SAT')
  const [prediction, setPrediction] = useState(null)
  const [selectedAPs, setSelectedAPs] = useState([])

  const runPredict = async () => {
    const prompt = `Current ${tab} Score: ${tab === 'SAT' ? testScores.satCurrent : testScores.actCurrent || 'Not yet taken'}
Target Score: ${tab === 'SAT' ? testScores.satTarget : testScores.actTarget || 'Not specified'}
Study Hours/Week: ${testScores.satStudyHours || 5}
Test Date: ${testScores.satTestDate || 'Not specified'}

Predict their score trajectory.`

    const data = await callAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') setPrediction(data)
  }

  const toggleAP = (course) => {
    setSelectedAPs((prev) => prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course])
  }

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ STANDARDIZED ASSESSMENT INTELLIGENCE ]</span>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          TEST SCORE OPTIMIZATION
        </h1>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px', width: 'fit-content' }}>
        {['SAT', 'ACT', 'AP COURSES'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontFamily: 'Space Mono, monospace', fontSize: '11px', letterSpacing: '0.08em',
            padding: '10px 20px', border: 'none', borderRight: '1px solid var(--bg-border)',
            background: tab === t ? 'var(--accent-acid)' : 'transparent',
            color: tab === t ? 'var(--text-invert)' : 'var(--text-secondary)',
            cursor: 'none',
          }}>{t}</button>
        ))}
      </div>

      {/* SAT TAB */}
      {tab === 'SAT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '24px' }}>
            <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ CURRENT SCORE BASELINE ]</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>CURRENT SAT SCORE</p>
                <input className="input-dark" type="number" min="400" max="1600" placeholder="e.g. 1280" value={testScores.satCurrent} onChange={(e) => updateTestScores({ satCurrent: e.target.value })} />
              </div>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>TARGET SAT SCORE</p>
                <input className="input-dark" type="number" min="400" max="1600" placeholder="e.g. 1450" value={testScores.satTarget} onChange={(e) => updateTestScores({ satTarget: e.target.value })} />
              </div>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>STUDY HOURS / WEEK</p>
                <input className="input-dark" type="range" min="1" max="30" value={testScores.satStudyHours} onChange={(e) => updateTestScores({ satStudyHours: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-acid)' }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-acid)' }}>{testScores.satStudyHours} hrs/week</span>
              </div>
              <div>
                <p className="label-tag" style={{ marginBottom: '4px' }}>TEST DATE</p>
                <input className="input-dark" type="date" value={testScores.satTestDate} onChange={(e) => updateTestScores({ satTestDate: e.target.value })} style={{ colorScheme: 'dark' }} />
              </div>
            </div>

            <button className="btn-primary" onClick={runPredict} disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '20px', fontSize: '12px', padding: '12px' }}>
              {isLoading ? '[ ARCHITECT PROCESSING... ]' : '→ PREDICT MY SCORE'}
            </button>
          </div>

          <div style={{ background: 'var(--bg-void)', padding: '24px' }}>
            {prediction ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p className="label-tag" style={{ color: 'var(--accent-acid)', marginBottom: '8px' }}>PROJECTED SCORE RANGE</p>
                  <motion.p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '36px', color: 'var(--text-primary)' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 150 }}>
                    {prediction.projected_low} — {prediction.projected_high}
                  </motion.p>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    PERCENTILE JUMP: {prediction.current_percentile}th → {prediction.projected_percentile}th
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <ScoreGraph projections={prediction.weekly_projections} target={parseInt(testScores.satTarget) || 1400} current={parseInt(testScores.satCurrent) || 1200} />
                </div>

                {prediction.critical_gaps?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <span className="label-tag" style={{ display: 'block', marginBottom: '8px' }}>CRITICAL GAPS</span>
                    {prediction.critical_gaps.map((gap, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--bg-border)' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)', flex: 1 }}>{gap.area}</span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent-red)' }}>-{gap.deficit}pts</span>
                        <span style={{
                          fontFamily: 'Space Mono, monospace', fontSize: '8px', padding: '2px 6px',
                          border: '1px solid var(--accent-red)', color: 'var(--accent-red)', borderRadius: '2px',
                        }}>{gap.priority}</span>
                      </div>
                    ))}
                  </div>
                )}

                {prediction.study_tips?.map((tip, i) => (
                  <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '4px' }}>● {tip}</p>
                ))}
              </motion.div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--bg-border)', borderRadius: '4px', minHeight: '300px' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  [ AWAITING INPUT — ENTER SCORES AND RUN PREDICTION ]
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACT TAB */}
      {tab === 'ACT' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '24px' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ ACT SCORE BASELINE ]</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '500px' }}>
            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>CURRENT ACT COMPOSITE</p>
              <input className="input-dark" type="number" min="1" max="36" placeholder="1-36" value={testScores.actCurrent} onChange={(e) => updateTestScores({ actCurrent: e.target.value })} />
            </div>
            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>TARGET ACT COMPOSITE</p>
              <input className="input-dark" type="number" min="1" max="36" placeholder="1-36" value={testScores.actTarget} onChange={(e) => updateTestScores({ actTarget: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary" onClick={runPredict} disabled={isLoading} style={{ marginTop: '20px', fontSize: '12px', padding: '12px 24px' }}>
            {isLoading ? '[ ARCHITECT PROCESSING... ]' : '→ PREDICT MY SCORE'}
          </button>
        </div>
      )}

      {/* AP TAB */}
      {tab === 'AP COURSES' && (
        <div>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Select the AP courses you're taking. The Architect will assess your course rigor.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {AP_COURSES_LIST.map((course) => (
              <div key={course}
                className={`checkbox-chip ${selectedAPs.includes(course) ? 'selected' : ''}`}
                onClick={() => toggleAP(course)}
                style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px' }}>
                {selectedAPs.includes(course) ? '✓ ' : ''}{course}
              </div>
            ))}
          </div>
          {selectedAPs.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '4px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>{selectedAPs.length} AP COURSES SELECTED</span>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Course rigor: {selectedAPs.length >= 8 ? 'EXCEPTIONAL' : selectedAPs.length >= 5 ? 'STRONG' : selectedAPs.length >= 3 ? 'MODERATE' : 'DEVELOPING'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Score Comparison */}
      {(testScores.satCurrent || testScores.actCurrent) && collegeList.length > 0 && (
        <div style={{ marginTop: '24px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ SCORE COMPARISON — YOUR LIST ]</span>
          {collegeList.slice(0, 8).map((school) => (
            <div key={school.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px solid var(--bg-border)' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-primary)', width: '180px' }}>{school.name}</span>
              <div style={{ flex: 1, height: '6px', background: 'var(--bg-border)', position: 'relative', borderRadius: '0' }}>
                <div style={{ position: 'absolute', left: '25%', width: '50%', height: '100%', background: 'rgba(200, 241, 53, 0.2)' }} />
                <div style={{
                  position: 'absolute', left: `${Math.min(((parseInt(testScores.satCurrent) || 1200) / 1600) * 100, 100)}%`,
                  top: '-3px', width: '6px', height: '12px', background: 'var(--accent-acid)', borderRadius: '1px',
                  transform: 'translateX(-50%)',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
