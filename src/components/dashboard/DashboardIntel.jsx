import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const FILTERS = ['ALL', 'USA', 'UK', 'CANADA', 'EUROPE', 'ASIA']

const UNIVERSITIES = [
  { name: 'Massachusetts Institute of Technology', short: 'MIT', country: 'USA', region: 'USA', score: 9.1, softSpot: 'Independent research + maker projects', hiddenValue: 'Unconventional problem-solving approach', idealOutlier: 'Self-directed builders with published work', overview: 'MIT rewards intellectual intensity over academic conformity.', essayTip: 'Lead with a specific technical problem you solved autonomously.' },
  { name: 'Stanford University', short: 'Stanford', country: 'USA', region: 'USA', score: 8.7, softSpot: 'Entrepreneurial impact + narrative arc', hiddenValue: 'World-changing ambition with execution proof', idealOutlier: 'Founders, social impact architects', overview: 'Stanford filters for people who want to change systems.', essayTip: 'Frame around a specific problem you are obsessed with solving.' },
  { name: 'University of Oxford', short: 'Oxford', country: 'UK', region: 'UK', score: 6.8, softSpot: 'Interview performance + subject depth', hiddenValue: 'Intellectual curiosity beyond syllabus', idealOutlier: 'Students who read extensively outside their subject', overview: 'Oxford\'s interview is the great equalizer.', essayTip: 'Demonstrate reading BEYOND the A-level syllabus.' },
  { name: 'University of Cambridge', short: 'Cambridge', country: 'UK', region: 'UK', score: 6.5, softSpot: 'Aptitude tests + interview', hiddenValue: 'Precision thinking and intellectual humility', idealOutlier: 'Students who thrive in structured academic environments', overview: 'Cambridge is more rigorous and formal than Oxford.', essayTip: 'Be precise. Name exact theories, papers, experiments.' },
  { name: 'Columbia University', short: 'Columbia', country: 'USA', region: 'USA', score: 8.3, softSpot: 'Urban engagement + intellectual range', hiddenValue: 'Core Curriculum alignment', idealOutlier: 'Cross-disciplinary students who thrive in NYC', overview: 'Columbia wants intellectually omnivorous students.', essayTip: 'Reference specific Core Curriculum texts.' },
  { name: 'Yale University', short: 'Yale', country: 'USA', region: 'USA', score: 8.5, softSpot: 'Community impact + residential culture', hiddenValue: 'Authentic human narrative', idealOutlier: 'Deep single-community impact students', overview: 'Yale strongly values community and character.', essayTip: 'Name professors, programs, clubs for Why Yale.' },
  { name: 'University of Toronto', short: 'U of T', country: 'Canada', region: 'CANADA', score: 8.0, softSpot: 'Research experience + equity', hiddenValue: 'Independent scholarship capacity', idealOutlier: 'Students with research or publication experience', overview: 'U of T values early research exposure significantly.', essayTip: 'Lead with research experience if you have it.' },
  { name: 'ETH Zurich', short: 'ETH', country: 'Switzerland', region: 'EUROPE', score: 7.6, softSpot: 'Technical aptitude + quantitative excellence', hiddenValue: 'Mathematical precision', idealOutlier: 'Self-taught programmers with competition history', overview: 'Europe\'s MIT equivalent.', essayTip: 'Be precise and quantitative. Describe technical mastery.' },
  { name: 'National University of Singapore', short: 'NUS', country: 'Singapore', region: 'ASIA', score: 8.2, softSpot: 'Industry projects + leadership', hiddenValue: 'Pragmatic knowledge application', idealOutlier: 'Students with startup or industry internships', overview: 'Asia\'s highest-ranked university.', essayTip: 'Show awareness of Asian and global markets.' },
  { name: 'Imperial College London', short: 'Imperial', country: 'UK', region: 'UK', score: 7.2, softSpot: 'Technical projects + research', hiddenValue: 'Practical engineering application', idealOutlier: 'Competition + industry placement students', overview: 'STEM-focused, values technical demonstration.', essayTip: 'Lead with a specific technical challenge you tackled.' },
  { name: 'UCL', short: 'UCL', country: 'UK', region: 'UK', score: 7.9, softSpot: 'Global perspective + interdisciplinary', hiddenValue: 'International outlook', idealOutlier: 'Students with cross-cultural projects', overview: 'Strong international identity.', essayTip: 'Connect academic interest to a global problem.' },
  { name: 'LSE', short: 'LSE', country: 'UK', region: 'UK', score: 7.4, softSpot: 'Political awareness + economic thinking', hiddenValue: 'Policy and systems-level thinking', idealOutlier: 'Students engaged with economics outside class', overview: 'Intensely focused on social sciences.', essayTip: 'Reference contemporary events and their mechanisms.' },
]

export default function DashboardIntel() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const { addCollege } = useAppStore()

  const filtered = UNIVERSITIES.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.short.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || u.region === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ INSTITUTIONAL INTELLIGENCE ]</span>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          KNOWN TARGETS
        </h1>
      </motion.div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="input-dark" placeholder="SEARCH INSTITUTION DATABASE..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '40px', fontFamily: 'Space Mono, monospace', fontSize: '11px', letterSpacing: '0.08em' }} />
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.1em',
            padding: '6px 14px', border: '1px solid', borderRadius: '2px',
            background: filter === f ? 'var(--accent-acid)' : 'transparent',
            borderColor: filter === f ? 'var(--accent-acid)' : 'var(--bg-border)',
            color: filter === f ? 'var(--text-invert)' : 'var(--text-secondary)',
            cursor: 'none', transition: 'all 0.15s ease',
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--bg-border)' }}>
        {filtered.map((uni) => (
          <div key={uni.short} className="card" style={{ borderRadius: 0, cursor: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>{uni.short}</h3>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{uni.country}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--accent-acid)' }}>[ {uni.score} ]</div>
                <div className="exploit-bar" style={{ width: '60px', marginLeft: 'auto' }}>
                  <div className="exploit-fill" style={{ width: `${(uni.score / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-acid)' }}>●</span> SOFT SPOT: {uni.softSpot}
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-acid)' }}>●</span> HIDDEN VALUE: {uni.hiddenValue}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-dark" onClick={() => setSelected(uni)} style={{ fontSize: '10px', padding: '6px 12px' }}>VIEW INTEL</button>
              <button className="btn-dark" onClick={() => addCollege({ name: uni.name, country: uni.country, type: 'TARGET' })} style={{ fontSize: '10px', padding: '6px 12px' }}>+ ADD TO LIST</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ INSTITUTIONAL PROFILE ]</span>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '24px', color: 'var(--text-primary)', marginTop: '6px' }}>{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'none' }}><X size={18} /></button>
            </div>
            {[
              ['OVERVIEW', selected.overview],
              ['IDEAL OUTLIER', selected.idealOutlier],
              ['ESSAY INTELLIGENCE', selected.essayTip],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--bg-border)' }}>
                <p className="label-tag" style={{ marginBottom: '6px' }}>{label}</p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{val}</p>
              </div>
            ))}
            <button className="btn-primary" onClick={() => { addCollege({ name: selected.name, country: selected.country, type: 'TARGET' }); setSelected(null) }} style={{ width: '100%', justifyContent: 'center' }}>
              → ADD TO COLLEGE LIST
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
