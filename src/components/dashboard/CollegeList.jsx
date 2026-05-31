import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const SCHOOL_DB = [
  { name: 'Harvard University', country: 'USA', acceptance: '3%', type: 'REACH' },
  { name: 'Stanford University', country: 'USA', acceptance: '4%', type: 'REACH' },
  { name: 'MIT', country: 'USA', acceptance: '4%', type: 'REACH' },
  { name: 'Yale University', country: 'USA', acceptance: '5%', type: 'REACH' },
  { name: 'Princeton University', country: 'USA', acceptance: '4%', type: 'REACH' },
  { name: 'Columbia University', country: 'USA', acceptance: '4%', type: 'REACH' },
  { name: 'University of Chicago', country: 'USA', acceptance: '5%', type: 'REACH' },
  { name: 'Duke University', country: 'USA', acceptance: '6%', type: 'REACH' },
  { name: 'Northwestern University', country: 'USA', acceptance: '7%', type: 'TARGET' },
  { name: 'Brown University', country: 'USA', acceptance: '5%', type: 'REACH' },
  { name: 'Cornell University', country: 'USA', acceptance: '8%', type: 'TARGET' },
  { name: 'University of Michigan', country: 'USA', acceptance: '18%', type: 'TARGET' },
  { name: 'Georgia Tech', country: 'USA', acceptance: '17%', type: 'TARGET' },
  { name: 'University of Virginia', country: 'USA', acceptance: '19%', type: 'TARGET' },
  { name: 'USC', country: 'USA', acceptance: '12%', type: 'TARGET' },
  { name: 'Boston University', country: 'USA', acceptance: '14%', type: 'TARGET' },
  { name: 'University of Wisconsin', country: 'USA', acceptance: '49%', type: 'SAFETY' },
  { name: 'Penn State', country: 'USA', acceptance: '54%', type: 'SAFETY' },
  { name: 'Arizona State University', country: 'USA', acceptance: '88%', type: 'SAFETY' },
  { name: 'University of Oxford', country: 'UK', acceptance: '15%', type: 'REACH' },
  { name: 'University of Cambridge', country: 'UK', acceptance: '18%', type: 'REACH' },
  { name: 'Imperial College London', country: 'UK', acceptance: '12%', type: 'TARGET' },
  { name: 'UCL', country: 'UK', acceptance: '32%', type: 'TARGET' },
  { name: 'University of Toronto', country: 'Canada', acceptance: '43%', type: 'SAFETY' },
  { name: 'McGill University', country: 'Canada', acceptance: '42%', type: 'SAFETY' },
  { name: 'NUS', country: 'Singapore', acceptance: '15%', type: 'TARGET' },
  { name: 'ETH Zurich', country: 'Switzerland', acceptance: '27%', type: 'TARGET' },
]

const STATUS_OPTIONS = ['NOT STARTED', 'IN PROGRESS', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WAITLISTED']

const LIST_REVIEW_SYSTEM = `You are the ARCHITECT College List Advisor. Analyze a student's college list for strategic balance.

Return ONLY valid JSON:
{
  "assessment": "Overall assessment paragraph",
  "risk_level": "HIGH" or "MODERATE" or "LOW",
  "zero_offer_probability": 67,
  "recommendations": ["suggestion 1", "suggestion 2"],
  "hidden_gems": [
    {"name": "School Name", "reason": "Why this student would be competitive here"}
  ]
}`

export default function CollegeList() {
  const { collegeList, addCollege, updateCollege, removeCollege, studentProfile } = useAppStore()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const { callAPI, isLoading } = useClaudeAPI({ systemPrompt: LIST_REVIEW_SYSTEM, maxTokens: 1500 })
  const [reviewResult, setReviewResult] = useState(null)

  const reachCount = collegeList.filter((c) => c.type === 'REACH').length
  const targetCount = collegeList.filter((c) => c.type === 'TARGET').length
  const safetyCount = collegeList.filter((c) => c.type === 'SAFETY').length
  const total = collegeList.length

  const searchResults = search.trim()
    ? SCHOOL_DB.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) &&
        !collegeList.find((c) => c.name === s.name)
      ).slice(0, 8)
    : []

  const handleAddSchool = (school) => {
    addCollege({ name: school.name, country: school.country, type: school.type, acceptance: school.acceptance })
    setSearch('')
  }

  const runListReview = async () => {
    const listSummary = collegeList.map((c) => `${c.name} (${c.type}) — Status: ${c.status}`).join('\n')
    const prompt = `Student: ${studentProfile.name || 'Student'}, GPA: ${studentProfile.gpa || 'N/A'}, Target Major: ${studentProfile.targetCourse || 'N/A'}

College List (${total} schools):
${listSummary}

Breakdown: ${reachCount} Reach, ${targetCount} Target, ${safetyCount} Safety

Analyze this list for strategic balance.`

    const data = await callAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') setReviewResult(data)
  }

  const typeColor = (type) => type === 'REACH' ? '#ff3b30' : type === 'SAFETY' ? '#34c759' : '#f5a623'

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '8px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ STRATEGIC DEPLOYMENT TARGETS ]</span>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          BUILD YOUR COLLEGE LIST
        </h1>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
          Target 12-15 schools. Aim for 3 Reach / 5 Target / 4 Safety. The Architect will flag imbalances.
        </p>
      </motion.div>

      {/* Balance Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', marginBottom: '16px', marginTop: '24px', overflow: 'hidden' }}>
        {[
          { label: 'REACH SCHOOLS', count: reachCount, target: 3, color: '#ff3b30' },
          { label: 'TARGET SCHOOLS', count: targetCount, target: 5, color: '#f5a623' },
          { label: 'SAFETY SCHOOLS', count: safetyCount, target: 4, color: '#34c759' },
        ].map((cat) => (
          <div key={cat.label} style={{ background: 'var(--bg-surface)', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '8px' }}>{cat.label}</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '24px', color: cat.color }}>
              {cat.count} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {cat.target} REC</span>
            </p>
            <div style={{ height: '3px', background: 'var(--bg-border)', marginTop: '8px' }}>
              <div style={{ height: '100%', width: `${Math.min((cat.count / cat.target) * 100, 100)}%`, background: cat.color, transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* List Health Meter */}
      {total > 0 && (
        <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--bg-border)' }}>
          <div style={{ width: `${(reachCount / total) * 100}%`, background: '#ff3b30', transition: 'width 0.3s' }} />
          <div style={{ width: `${(targetCount / total) * 100}%`, background: '#f5a623', transition: 'width 0.3s' }} />
          <div style={{ width: `${(safetyCount / total) * 100}%`, background: '#34c759', transition: 'width 0.3s' }} />
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', zIndex: 1 }} />
        <input className="input-dark" placeholder="SEARCH 500+ UNIVERSITIES..." value={search}
          onChange={(e) => setSearch(e.target.value)} onFocus={() => setShowSearch(true)}
          style={{ paddingLeft: '40px', fontFamily: 'Space Mono, monospace', fontSize: '11px', letterSpacing: '0.08em' }} />

        {showSearch && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
            borderTop: 'none', borderRadius: '0 0 4px 4px', maxHeight: '280px', overflowY: 'auto',
          }}>
            {searchResults.map((s) => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 16px', borderBottom: '1px solid var(--bg-border)',
                cursor: 'none',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{s.name}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-secondary)' }}>{s.country}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)' }}>{s.acceptance}</span>
                <button className="btn-dark" onClick={() => handleAddSchool(s)} style={{ fontSize: '9px', padding: '4px 10px' }}>
                  <Plus size={10} /> ADD
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* College Table */}
      {collegeList.length > 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 80px 130px 80px', gap: '8px', padding: '10px 16px', borderBottom: '1px solid var(--bg-border)', background: 'var(--bg-elevated)' }}>
            {['SCHOOL', 'TYPE', 'DEADLINE', 'ODDS', 'STATUS', 'ACTIONS'].map((h) => (
              <span key={h} style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {collegeList.map((school) => (
            <div key={school.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 80px 100px 80px 130px 80px', gap: '8px',
              padding: '12px 16px', borderBottom: '1px solid var(--bg-border)',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{school.name}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>{school.country}</span>
              </div>

              <select value={school.type} onChange={(e) => updateCollege(school.id, { type: e.target.value })}
                style={{
                  fontFamily: 'Space Mono, monospace', fontSize: '8px',
                  padding: '3px 6px', borderRadius: '100px', border: 'none',
                  background: `${typeColor(school.type)}20`, color: typeColor(school.type),
                  cursor: 'none', outline: 'none', letterSpacing: '0.05em',
                }}>
                <option value="REACH">REACH</option>
                <option value="TARGET">TARGET</option>
                <option value="SAFETY">SAFETY</option>
              </select>

              <input type="date" className="input-dark" value={school.deadline || ''} onChange={(e) => updateCollege(school.id, { deadline: e.target.value })}
                style={{ fontSize: '10px', padding: '4px 6px', colorScheme: 'dark' }} />

              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: school.odds ? 'var(--accent-acid)' : 'var(--text-tertiary)' }}>
                {school.odds ? `${school.odds}%` : '—'}
              </span>

              <select value={school.status} onChange={(e) => updateCollege(school.id, { status: e.target.value })}
                className="input-dark" style={{ fontSize: '9px', padding: '4px 6px' }}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <button onClick={() => removeCollege(school.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'none', padding: '4px' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          border: '1px dashed var(--bg-border)', borderRadius: '4px', marginBottom: '24px',
        }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            [ NO TARGETS ACQUIRED — SEARCH AND ADD SCHOOLS ABOVE ]
          </p>
        </div>
      )}

      {/* Architect Review */}
      {collegeList.length >= 3 && (
        <div style={{ marginBottom: '24px' }}>
          <button className="btn-ghost" onClick={runListReview} disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '14px' }}>
            {isLoading ? '[ ARCHITECT PROCESSING... ]' : '→ ARCHITECT LIST REVIEW'}
          </button>

          {reviewResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderLeft: '3px solid var(--accent-acid)', borderRadius: '4px', padding: '20px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ ARCHITECT LIST REVIEW ]</span>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '16px' }}>
                {reviewResult.assessment}
              </p>
              {reviewResult.recommendations?.map((r, i) => (
                <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>● {r}</p>
              ))}
              {reviewResult.hidden_gems?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ HIDDEN GEM ALERT ]</span>
                  {reviewResult.hidden_gems.map((gem, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-void)', borderRadius: '2px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--accent-acid)' }}>{gem.name}</span>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{gem.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
