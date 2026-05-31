import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const ESSAY_TYPES = ['COMMON APP MAIN', 'SUPPLEMENT', 'WHY SCHOOL', 'ACTIVITY LIST', 'SHORT ANSWER']
const WORD_LIMITS = { 'COMMON APP MAIN': 650, 'SUPPLEMENT': 250, 'WHY SCHOOL': 400, 'ACTIVITY LIST': 150, 'SHORT ANSWER': 150 }

const ESSAY_SYSTEM = `You are the ARCHITECT Essay Analyst. Analyze the provided essay with clinical precision.

Return ONLY valid JSON:
{
  "scores": {
    "impact": 72,
    "originality": 65,
    "analysis_depth": 58,
    "voice_alignment": 80,
    "admissions_fit": 70
  },
  "narrative_strength": 7.2,
  "cliches_detected": [
    {"phrase": "exact phrase", "replacement": "suggested replacement"}
  ],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "reframe_suggestions": [
    {"original": "original phrase", "reframed": "stronger version"}
  ],
  "rewritten_opening": "A rewritten opening paragraph demonstrating narrative dominance."
}`

const BRAINSTORM_SYSTEM = `You are the ARCHITECT Essay Brainstormer. Given a student profile, generate 5 unique essay angles.

Return ONLY valid JSON:
{
  "angles": [
    {"title": "Angle title in bold", "expansion": "2 sentences expanding the angle."}
  ]
}`

function PentagonChart({ scores }) {
  const axes = ['impact', 'originality', 'analysis_depth', 'voice_alignment', 'admissions_fit']
  const labels = ['IMPACT', 'ORIGINALITY', 'ANALYSIS', 'VOICE', 'FIT']
  const center = 100
  const maxR = 80

  const angleStep = (2 * Math.PI) / 5
  const startAngle = -Math.PI / 2

  const getPoint = (idx, value) => {
    const angle = startAngle + idx * angleStep
    const r = (value / 100) * maxR
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  const outerPoints = axes.map((_, i) => getPoint(i, 100))
  const midPoints = axes.map((_, i) => getPoint(i, 50))
  const dataPoints = axes.map((a, i) => getPoint(i, scores?.[a] || 0))
  const labelPoints = axes.map((_, i) => getPoint(i, 120))

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      <polygon points={outerPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--bg-border)" strokeWidth="1" />
      <polygon points={midPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--bg-border)" strokeWidth="0.5" />
      {axes.map((_, i) => (
        <line key={i} x1={center} y1={center} x2={outerPoints[i].x} y2={outerPoints[i].y} stroke="var(--bg-border)" strokeWidth="0.5" />
      ))}
      <motion.polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="rgba(200, 241, 53, 0.15)" stroke="var(--accent-acid)" strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      {labels.map((l, i) => (
        <text key={i} x={labelPoints[i].x} y={labelPoints[i].y} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', fill: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
          {l}
        </text>
      ))}
    </svg>
  )
}

export default function EssayForge() {
  const { essays, addEssay, updateEssay, studentProfile, collegeList } = useAppStore()
  const { callAPI: analyze, isLoading: analyzing } = useClaudeAPI({ systemPrompt: ESSAY_SYSTEM, maxTokens: 2000 })
  const { callAPI: brainstorm, isLoading: brainstorming } = useClaudeAPI({ systemPrompt: BRAINSTORM_SYSTEM, maxTokens: 1500 })

  const [activeEssayId, setActiveEssayId] = useState(null)
  const [essayType, setEssayType] = useState('COMMON APP MAIN')
  const [school, setSchool] = useState('')
  const [content, setContent] = useState('')
  const [mode, setMode] = useState('WRITE')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [brainstormAngles, setBrainstormAngles] = useState([])
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    setLineCount(Math.max(content.split('\n').length, 1))
  }, [content])

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const wordLimit = WORD_LIMITS[essayType] || 650

  const saveEssay = () => {
    if (activeEssayId) {
      updateEssay(activeEssayId, { content, type: essayType, school })
    } else if (content.trim()) {
      addEssay({ content, type: essayType, school })
    }
  }

  const runAnalysis = async () => {
    if (!content.trim()) return
    saveEssay()
    const prompt = `Essay Type: ${essayType}
Target School: ${school || 'General'}
Word Count: ${wordCount} / ${wordLimit}

Student Profile Context:
- GPA: ${studentProfile.gpa || 'N/A'}
- Target: ${studentProfile.targetUniversity || school || 'N/A'}
- Spikes: ${studentProfile.spikeCategories?.join(', ') || 'N/A'}

ESSAY:
${content}`
    const data = await analyze(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') setAnalysisResult(data)
  }

  const runBrainstorm = async () => {
    const prompt = `Student Profile:
Name: ${studentProfile.name || 'Student'}
GPA: ${studentProfile.gpa || 'N/A'}
Target Schools: ${studentProfile.dreamSchools?.filter(Boolean).join(', ') || 'N/A'}
Spikes: ${studentProfile.spikeCategories?.join(', ') || 'N/A'}
Unusual Achievement: ${studentProfile.unusualAchievement || 'N/A'}
Biggest Concern: ${studentProfile.biggestConcern || 'N/A'}

Generate 5 unique, compelling essay angle suggestions.`
    const data = await brainstorm(prompt, { stream: false, jsonMode: true })
    if (data?.angles) setBrainstormAngles(data.angles)
  }

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ NARRATIVE ENGINE — ENHANCED ]</span>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 900,
          fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)',
          marginTop: '4px', letterSpacing: '-0.02em',
        }}>
          ESSAY FORGE
        </h1>
      </motion.div>

      {/* Controls Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Essay Type Tabs */}
        <div style={{ display: 'flex', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>
          {ESSAY_TYPES.map((t) => (
            <button key={t} onClick={() => setEssayType(t)} style={{
              fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.06em',
              padding: '8px 12px', border: 'none', borderRight: '1px solid var(--bg-border)',
              background: essayType === t ? 'var(--accent-acid)' : 'transparent',
              color: essayType === t ? 'var(--text-invert)' : 'var(--text-secondary)',
              cursor: 'none', whiteSpace: 'nowrap',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* School Target */}
        <select className="input-dark" style={{ width: '200px', fontSize: '11px' }} value={school} onChange={(e) => setSchool(e.target.value)}>
          <option value="">TARGET SCHOOL (OPTIONAL)</option>
          {collegeList.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        {/* Mode Toggle */}
        <div className="toggle-group">
          <div className={`toggle-option ${mode === 'WRITE' ? 'active' : ''}`} onClick={() => setMode('WRITE')}>WRITE MODE</div>
          <div className={`toggle-option ${mode === 'BRAINSTORM' ? 'active' : ''}`} onClick={() => setMode('BRAINSTORM')}>BRAINSTORM</div>
        </div>

        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: wordCount > wordLimit ? 'var(--accent-red)' : 'var(--text-tertiary)', marginLeft: 'auto' }}>
          {wordCount} / {wordLimit} words
        </span>
      </div>

      {/* Main Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>
        {/* Left: Editor */}
        <div style={{ background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between' }}>
            <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ NARRATIVE INPUT ]</span>
            <div style={{ width: `${Math.min((wordCount / wordLimit) * 100, 100)}%`, height: '3px', background: wordCount > wordLimit ? 'var(--accent-red)' : 'var(--accent-acid)', alignSelf: 'center', maxWidth: '100px', transition: 'width 0.3s' }} />
          </div>
          <div className="essay-editor-wrap" style={{ flex: 1 }}>
            <div className="line-numbers">
              {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              className="essay-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin your narrative..."
              style={{ minHeight: '400px' }}
            />
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={runAnalysis} disabled={analyzing || !content.trim()} style={{ fontSize: '11px', padding: '8px 16px', opacity: content.trim() ? 1 : 0.5 }}>
              <BarChart2 size={12} />
              {analyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
            </button>
            <button className="btn-dark" onClick={saveEssay} style={{ fontSize: '10px', padding: '8px 12px' }}>SAVE</button>
            <button className="btn-dark" onClick={() => { setContent(''); setAnalysisResult(null) }} style={{ fontSize: '10px', padding: '8px 12px' }}>CLEAR</button>
          </div>
        </div>

        {/* Right: Analysis / Brainstorm */}
        <div style={{ background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
          {mode === 'BRAINSTORM' ? (
            <div style={{ padding: '16px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ BRAINSTORM MODE ]</span>
              <button className="btn-primary" onClick={runBrainstorm} disabled={brainstorming} style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '12px', marginBottom: '16px' }}>
                {brainstorming ? '[ ARCHITECT PROCESSING... ]' : 'GENERATE 5 ESSAY ANGLES'}
              </button>
              {brainstormAngles.map((angle, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '16px', marginBottom: '8px' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>{angle.title}</p>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>{angle.expansion}</p>
                  <button className="btn-dark" style={{ fontSize: '9px', padding: '4px 10px' }}>DEVELOP THIS →</button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ ARCHITECT ASSESSMENT ]</span>
              {analysisResult ? (
                <div>
                  {/* Pentagon Chart */}
                  {analysisResult.scores && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <PentagonChart scores={analysisResult.scores} />
                    </div>
                  )}

                  {/* Score bars */}
                  {analysisResult.scores && Object.entries(analysisResult.scores).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--text-secondary)', letterSpacing: '0.08em', width: '80px' }}>
                        {key.toUpperCase().replace(/_/g, ' ')}
                      </span>
                      <div style={{ flex: 1, height: '4px', background: 'var(--bg-border)' }}>
                        <motion.div style={{ height: '100%', background: val >= 70 ? 'var(--accent-acid)' : val >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }}
                          initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-primary)', width: '30px', textAlign: 'right' }}>{val}</span>
                    </div>
                  ))}

                  {/* Clichés */}
                  {analysisResult.cliches_detected?.length > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '4px' }}>
                      <span className="label-tag" style={{ color: 'var(--accent-red)', marginBottom: '8px', display: 'block' }}>
                        DETECTED CLICHÉS: {analysisResult.cliches_detected.length}
                      </span>
                      {analysisResult.cliches_detected.map((c, i) => (
                        <div key={i} style={{ marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent-red)', textDecoration: 'line-through' }}>{c.phrase}</span>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent-acid)', marginLeft: '8px' }}>→ {c.replacement}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations && (
                    <div style={{ marginTop: '16px' }}>
                      <span className="label-tag" style={{ marginBottom: '8px', display: 'block' }}>RECOMMENDATIONS</span>
                      {analysisResult.recommendations.map((r, i) => (
                        <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '4px' }}>● {r}</p>
                      ))}
                    </div>
                  )}

                  {/* Rewritten Opening */}
                  {analysisResult.rewritten_opening && (
                    <div style={{ marginTop: '16px', padding: '12px', borderLeft: '3px solid var(--accent-acid)', background: 'var(--bg-elevated)', borderRadius: '4px' }}>
                      <span className="label-tag" style={{ color: 'var(--accent-acid)', marginBottom: '8px', display: 'block' }}>REWRITTEN OPENING</span>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.7 }}>{analysisResult.rewritten_opening}</p>
                    </div>
                  )}
                </div>
              ) : analyzing ? (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-acid)' }}>[ ARCHITECT PROCESSING... ]</p>
              ) : (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
                  [ NO INTEL AVAILABLE — BEGIN AUDIT ]<br /><br />
                  Write or paste your essay, then run the analysis for tactical feedback.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
