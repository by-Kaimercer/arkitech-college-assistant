import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit3, Trash2, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const ACTIVITY_TYPES = ['TECHNICAL', 'ATHLETIC', 'COMMUNITY', 'RESEARCH', 'ARTISTIC', 'LEADERSHIP', 'ENTREPRENEURSHIP']
const TYPE_COLORS = {
  TECHNICAL: '#6bb5ff', ATHLETIC: '#ff6b6b', COMMUNITY: '#ffc107',
  RESEARCH: '#a78bfa', ARTISTIC: '#f472b6', LEADERSHIP: '#34d399', ENTREPRENEURSHIP: '#fb923c',
}
const YEARS = ['9th', '10th', '11th', '12th']

const OPTIMIZE_SYSTEM = `You are the ARCHITECT Activity Optimizer. Given an extracurricular activity description, optimize it for maximum impact in 150 characters or less.

Return ONLY valid JSON:
{
  "original_score": 42,
  "optimized_score": 87,
  "optimized_description": "Optimized 150-char description here",
  "improvements": [
    "Added quantified impact",
    "Leadership framing",
    "Concrete outcome"
  ]
}`

const PORTFOLIO_SYSTEM = `You are the ARCHITECT Portfolio Analyst. Given all of a student's activities, analyze the overall narrative coherence.

Return ONLY valid JSON:
{
  "spike_narrative": "Description of the coherent spike narrative",
  "positioning": "Frame you as: CATEGORY + CATEGORY",
  "weakest_activities": ["name1", "name2"],
  "recommended_order": ["name1", "name2", "name3"],
  "strategic_note": "Overall strategic recommendation paragraph."
}`

export default function ActivityOps() {
  const { activities, addActivity, updateActivity, removeActivity, studentProfile } = useAppStore()
  const { callAPI: optimizeAPI, isLoading: optimizing } = useClaudeAPI({ systemPrompt: OPTIMIZE_SYSTEM, maxTokens: 800 })
  const { callAPI: portfolioAPI, isLoading: analyzingPortfolio } = useClaudeAPI({ systemPrompt: PORTFOLIO_SYSTEM, maxTokens: 1500 })
  const [optimizingId, setOptimizingId] = useState(null)
  const [portfolioResult, setPortfolioResult] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const leadershipCount = activities.filter((a) => a.type === 'LEADERSHIP' || a.role?.toLowerCase().includes('lead') || a.role?.toLowerCase().includes('president') || a.role?.toLowerCase().includes('founder')).length
  const leadershipDensity = activities.length > 0 ? Math.round((leadershipCount / activities.length) * 100) : 0
  const avgScore = activities.length > 0
    ? Math.round(activities.reduce((sum, a) => sum + (a.optimizedScore || a.originalScore || 0), 0) / activities.length)
    : 0

  const handleAddActivity = () => {
    addActivity({
      name: 'New Activity',
      type: 'TECHNICAL',
      role: '',
      organization: '',
      hoursPerWeek: '',
      weeksPerYear: '',
      yearsActive: [],
      description: '',
    })
  }

  const optimizeActivity = async (activity) => {
    setOptimizingId(activity.id)
    const prompt = `Activity: ${activity.name}
Type: ${activity.type}
Role: ${activity.role}
Organization: ${activity.organization}
Hours/week: ${activity.hoursPerWeek}, Weeks/year: ${activity.weeksPerYear}
Years: ${activity.yearsActive.join(', ')}
Current Description (${activity.description.length}/150 chars): ${activity.description}

Student Context: GPA ${studentProfile.gpa || 'N/A'}, targeting ${studentProfile.targetUniversity || 'top schools'}

Optimize this activity description.`

    const data = await optimizeAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') {
      updateActivity(activity.id, {
        originalScore: data.original_score,
        optimizedScore: data.optimized_score,
        optimizedDescription: data.optimized_description,
        improvements: data.improvements,
      })
    }
    setOptimizingId(null)
  }

  const runPortfolioAnalysis = async () => {
    const activitiesSummary = activities.map((a) => `${a.name} (${a.type}) — ${a.role} — ${a.description}`).join('\n')
    const prompt = `Student: ${studentProfile.name || 'Student'}, GPA: ${studentProfile.gpa || 'N/A'}, Target: ${studentProfile.targetUniversity || 'Top schools'}

Activities:\n${activitiesSummary}

Analyze the full portfolio.`

    const data = await portfolioAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') setPortfolioResult(data)
  }

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ EXTRACURRICULAR INTELLIGENCE ]</span>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          MAXIMIZE YOUR ACTIVITIES
        </h1>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
        {[
          { label: 'ACTIVITIES ENTERED', value: activities.length },
          { label: 'AVG DESCRIPTION SCORE', value: avgScore ? `${avgScore} / 100` : '—' },
          { label: 'ESTIMATED IMPRESSION', value: avgScore >= 70 ? 'STRONG' : avgScore >= 50 ? 'ABOVE AVG' : 'NEEDS WORK', color: avgScore >= 70 ? 'var(--accent-acid)' : 'var(--accent-amber)' },
          { label: 'LEADERSHIP DENSITY', value: `${leadershipDensity}%` },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--bg-surface)', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '24px', color: stat.color || 'var(--text-primary)', marginBottom: '4px' }}>{stat.value}</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button className="btn-ghost" onClick={handleAddActivity} style={{ marginBottom: '20px', fontSize: '11px' }}>
        <Plus size={14} /> ADD ACTIVITY
      </button>

      {/* Activity Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div key={activity.id} layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
                borderRadius: '4px', padding: '20px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-acid)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--bg-border)'}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  value={activity.name} style={{
                    background: 'none', border: 'none', fontFamily: 'Syne, sans-serif',
                    fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', flex: 1, outline: 'none',
                  }}
                  onChange={(e) => updateActivity(activity.id, { name: e.target.value })}
                />
                <select value={activity.type} onChange={(e) => updateActivity(activity.id, { type: e.target.value })}
                  style={{
                    fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.08em',
                    padding: '4px 8px', borderRadius: '100px', border: 'none',
                    background: `${TYPE_COLORS[activity.type]}20`, color: TYPE_COLORS[activity.type],
                    cursor: 'none', outline: 'none',
                  }}>
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => removeActivity(activity.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'none', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <p className="label-tag" style={{ marginBottom: '4px' }}>ROLE</p>
                  <input className="input-dark" placeholder="e.g. President" value={activity.role} onChange={(e) => updateActivity(activity.id, { role: e.target.value })} />
                </div>
                <div>
                  <p className="label-tag" style={{ marginBottom: '4px' }}>ORGANIZATION</p>
                  <input className="input-dark" placeholder="e.g. Robotics Club" value={activity.organization} onChange={(e) => updateActivity(activity.id, { organization: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <p className="label-tag" style={{ marginBottom: '4px' }}>HRS/WEEK</p>
                  <input className="input-dark" type="number" min="0" value={activity.hoursPerWeek} onChange={(e) => updateActivity(activity.id, { hoursPerWeek: e.target.value })} />
                </div>
                <div>
                  <p className="label-tag" style={{ marginBottom: '4px' }}>WEEKS/YEAR</p>
                  <input className="input-dark" type="number" min="0" value={activity.weeksPerYear} onChange={(e) => updateActivity(activity.id, { weeksPerYear: e.target.value })} />
                </div>
                <div>
                  <p className="label-tag" style={{ marginBottom: '4px' }}>YEARS ACTIVE</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {YEARS.map((y) => (
                      <div key={y}
                        className={`checkbox-chip ${activity.yearsActive?.includes(y) ? 'selected' : ''}`}
                        onClick={() => {
                          const yrs = activity.yearsActive || []
                          updateActivity(activity.id, {
                            yearsActive: yrs.includes(y) ? yrs.filter((x) => x !== y) : [...yrs, y],
                          })
                        }}
                      >{y}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p className="label-tag">DESCRIPTION (150 CHAR LIMIT)</p>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '10px',
                    color: (activity.description?.length || 0) > 150 ? 'var(--accent-red)' : 'var(--text-tertiary)',
                  }}>
                    {activity.description?.length || 0} / 150
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <textarea className="input-dark" rows={2} maxLength={150}
                    value={activity.description} onChange={(e) => updateActivity(activity.id, { description: e.target.value })}
                    placeholder="Describe your role and impact..."
                    style={{ resize: 'none', lineHeight: 1.6 }}
                  />
                  <div style={{
                    height: '3px', background: 'var(--bg-border)', marginTop: '4px',
                  }}>
                    <div style={{
                      height: '100%', transition: 'width 0.2s, background 0.2s',
                      width: `${Math.min(((activity.description?.length || 0) / 150) * 100, 100)}%`,
                      background: (activity.description?.length || 0) > 140 ? 'var(--accent-red)' : 'var(--accent-acid)',
                    }} />
                  </div>
                </div>
              </div>

              {/* Optimize Button */}
              <button className="btn-primary" onClick={() => optimizeActivity(activity)} disabled={optimizingId === activity.id}
                style={{ fontSize: '11px', padding: '8px 16px' }}>
                {optimizingId === activity.id ? '[ ARCHITECT ANALYZING... ]' : '→ OPTIMIZE WITH ARCHITECT'}
              </button>

              {/* Optimized Result */}
              {activity.optimizedDescription && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '16px', padding: '16px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
                    borderRadius: '4px',
                  }}>
                  <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ ARCHITECT OPTIMIZED VERSION ]</span>

                  <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                    <div>
                      <p className="label-tag" style={{ marginBottom: '4px' }}>ORIGINAL SCORE</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: 'var(--text-secondary)' }}>[ {activity.originalScore} / 100 ]</span>
                        <div style={{ width: '80px', height: '4px', background: 'var(--bg-border)' }}>
                          <div style={{ height: '100%', width: `${activity.originalScore}%`, background: 'var(--accent-amber)' }} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="label-tag" style={{ marginBottom: '4px' }}>OPTIMIZED SCORE</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: 'var(--accent-acid)' }}>[ {activity.optimizedScore} / 100 ]</span>
                        <div style={{ width: '80px', height: '4px', background: 'var(--bg-border)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${activity.optimizedScore}%` }} transition={{ duration: 0.8 }}
                            style={{ height: '100%', background: 'var(--accent-acid)' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '12px', padding: '8px', background: 'var(--bg-void)', borderRadius: '2px' }}>
                    "{activity.optimizedDescription}"
                  </p>

                  {activity.improvements?.map((imp, i) => (
                    <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent-acid)', marginBottom: '2px' }}>+ {imp}</p>
                  ))}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn-primary" onClick={() => updateActivity(activity.id, { description: activity.optimizedDescription })} style={{ fontSize: '10px', padding: '6px 14px' }}>APPLY THIS VERSION</button>
                    <button className="btn-dark" onClick={() => optimizeActivity(activity)} style={{ fontSize: '10px', padding: '6px 14px' }}>GENERATE ALTERNATIVE</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Portfolio Analysis */}
      {activities.length >= 2 && (
        <div style={{ marginBottom: '24px' }}>
          <button className="btn-ghost" onClick={runPortfolioAnalysis} disabled={analyzingPortfolio}
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '14px' }}>
            {analyzingPortfolio ? '[ ARCHITECT PROCESSING... ]' : '→ RUN FULL PORTFOLIO ANALYSIS'}
          </button>

          {portfolioResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderLeft: '3px solid var(--accent-acid)', borderRadius: '4px', padding: '20px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ PORTFOLIO ANALYSIS ]</span>
              {portfolioResult.positioning && (
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--accent-acid)', marginBottom: '12px' }}>{portfolioResult.positioning}</p>
              )}
              {portfolioResult.spike_narrative && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>{portfolioResult.spike_narrative}</p>
              )}
              {portfolioResult.strategic_note && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.7 }}>{portfolioResult.strategic_note}</p>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
