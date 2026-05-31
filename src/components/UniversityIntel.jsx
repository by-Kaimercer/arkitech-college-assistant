import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

const FILTERS = ['ALL', 'USA', 'UK', 'CANADA', 'EUROPE', 'ASIA']

const UNIVERSITIES = [
  {
    name: 'Massachusetts Institute of Technology',
    short: 'MIT',
    country: 'USA',
    region: 'USA',
    score: 9.1,
    softSpot: 'Independent research + maker projects',
    hiddenValue: 'Unconventional problem-solving approach',
    idealOutlier: 'Self-directed builders with published work',
    overview: 'MIT rewards intellectual intensity over academic conformity. The admissions process values what you have built, not just what you have studied.',
    departmentNotes: 'Engineering departments care about proof-of-concept projects. Science programs look for published or presented research.',
    claimedValues: 'Academic excellence, innovation, collaboration',
    actualWeight: 'Maker culture, demonstrated independent research, technical depth beyond curriculum',
    essayTip: 'Lead with a specific technical problem you solved autonomously. Never open with grades or awards.',
    interviewCulture: 'Conversational, technical curiosity-driven. They want to see how you think, not what you know.',
  },
  {
    name: 'Stanford University',
    short: 'Stanford',
    country: 'USA',
    region: 'USA',
    score: 8.7,
    softSpot: 'Entrepreneurial impact + narrative arc',
    hiddenValue: 'World-changing ambition with execution proof',
    idealOutlier: 'Founders, social impact architects, cross-disciplinary thinkers',
    overview: 'Stanford filters for people who want to change systems, not just study them. The D.school ethos pervades admissions.',
    departmentNotes: 'CS department heavily weights side projects and startup experience. Humanities programs look for interdisciplinary reach.',
    claimedValues: 'Intellectual vitality, civic engagement, creativity',
    actualWeight: 'Entrepreneurial trajectory, demonstrated leadership at scale, cross-disciplinary thinking',
    essayTip: 'Frame your application around a specific problem you are obsessed with solving at a systems level.',
    interviewCulture: 'Warm but probing. They want to understand your "why" at a deep level.',
  },
  {
    name: 'University of Oxford',
    short: 'Oxford',
    country: 'UK',
    region: 'UK',
    score: 6.8,
    softSpot: 'Interview performance + subject passion depth',
    hiddenValue: 'Intellectual curiosity beyond the syllabus',
    idealOutlier: 'Students who read extensively outside their subject',
    overview: 'Oxford is the hardest to crack on pure non-academic factors — but the interview is the great equalizer for prepared candidates.',
    departmentNotes: 'PPE values political awareness and philosophical sharpness. Sciences value precise analytical thinking over creative flair.',
    claimedValues: 'Academic potential, subject passion, critical thinking',
    actualWeight: 'Tutorial-readiness — ability to argue, concede, and develop ideas in real-time',
    essayTip: 'The personal statement should demonstrate reading BEYOND the A-level syllabus. Name specific papers, books, and why they changed your thinking.',
    interviewCulture: 'Tutorial simulation. Tutors will push back on everything. Confidence under intellectual pressure is the key metric.',
  },
  {
    name: 'University of Cambridge',
    short: 'Cambridge',
    country: 'UK',
    region: 'UK',
    score: 6.5,
    softSpot: 'Subject-specific aptitude tests + interview',
    hiddenValue: 'Precision thinking and intellectual humility',
    idealOutlier: 'Students who thrive in structured academic environments with deep specialism',
    overview: 'Cambridge is more rigorous and formal than Oxford. The STEP papers and subject tests carry significant weight.',
    departmentNotes: 'Mathematics heavily weights STEP scores. Natural Sciences looks for strong lab report thinking.',
    claimedValues: 'Academic rigour, subject mastery, research potential',
    actualWeight: 'Aptitude test performance, subject-specific depth, ability to handle failure gracefully in interview',
    essayTip: 'Be precise. Cambridge admissions tutors have read thousands of vague essays. Name exact theories, papers, and experiments.',
    interviewCulture: 'Problem-solving in real-time. They give you unseen problems. The thought process matters more than the answer.',
  },
  {
    name: 'University College London',
    short: 'UCL',
    country: 'UK',
    region: 'UK',
    score: 7.9,
    softSpot: 'Global perspective + interdisciplinary projects',
    hiddenValue: 'International outlook and real-world application',
    idealOutlier: 'Students with cross-cultural projects or global social impact',
    overview: 'UCL has a strong international identity and rewards students who can connect academic theory to real-world global issues.',
    departmentNotes: 'Architecture values portfolio quality heavily. Medical programs prioritize voluntary clinical experience.',
    claimedValues: 'Academic excellence, diversity, global citizenship',
    actualWeight: 'Real-world application of knowledge, international perspective, portfolio or project evidence',
    essayTip: 'Connect your academic interest to a global problem you have personally engaged with.',
    interviewCulture: 'Friendly and exploratory. Less adversarial than Oxbridge. More about cultural fit and motivation.',
  },
  {
    name: 'London School of Economics',
    short: 'LSE',
    country: 'UK',
    region: 'UK',
    score: 7.4,
    softSpot: 'Political awareness + economic thinking',
    hiddenValue: 'Policy and systems-level thinking',
    idealOutlier: 'Students who have engaged with economics or policy outside the classroom',
    overview: 'LSE is intensely focused on social sciences. They want students who read The Economist and have opinions on monetary policy.',
    departmentNotes: 'Economics requires strong mathematical aptitude. Politics values original analysis over summarization.',
    claimedValues: 'Academic excellence, social responsibility, analytical rigour',
    actualWeight: 'Evidence of genuine engagement with economic or political issues, ability to form and defend arguments',
    essayTip: 'Reference specific contemporary economic or political events and explain their mechanisms — not just describe them.',
    interviewCulture: 'Debate-style. They will challenge your views on current affairs. Have informed positions ready.',
  },
  {
    name: 'Imperial College London',
    short: 'Imperial',
    country: 'UK',
    region: 'UK',
    score: 7.2,
    softSpot: 'Technical projects + research exposure',
    hiddenValue: 'Practical engineering application',
    idealOutlier: 'Students with competition experience or industry placements',
    overview: 'Imperial is STEM-focused and values technical demonstration. GPA matters more here than other UK institutions.',
    departmentNotes: 'Engineering rewards competition results (Olympiads, hackathons). Medicine values clinical volunteer hours.',
    claimedValues: 'Technical excellence, research, innovation',
    actualWeight: 'Technical depth, competition credentials, demonstrated STEM passion beyond curriculum',
    essayTip: 'Lead with a specific technical challenge you tackled and quantify your contribution.',
    interviewCulture: 'Problem-set focused. Expect calculation problems and technical reasoning under pressure.',
  },
  {
    name: 'Columbia University',
    short: 'Columbia',
    country: 'USA',
    region: 'USA',
    score: 8.3,
    softSpot: 'Urban engagement + intellectual range',
    hiddenValue: 'Core Curriculum alignment — broad intellectual curiosity',
    idealOutlier: 'Students who cross disciplines and thrive in NYC-style intensity',
    overview: 'Columbia Core Curriculum means they want intellectually omnivorous students, not just specialists.',
    departmentNotes: 'Journalism school weights published work and media projects. Engineering values cross-disciplinary projects.',
    claimedValues: 'Core Curriculum engagement, intellectual breadth, community contribution',
    actualWeight: 'Demonstrated range of intellectual interests, urban-oriented thinking, ability to handle rigorous general education',
    essayTip: 'Show that you would thrive in the Core. Reference specific texts from their curriculum and explain your perspective.',
    interviewCulture: 'Intellectually charged. Expect to discuss ideas across multiple disciplines.',
  },
  {
    name: 'Yale University',
    short: 'Yale',
    country: 'USA',
    region: 'USA',
    score: 8.5,
    softSpot: 'Community impact + residential college culture',
    hiddenValue: 'Authentic human narrative over achievement list',
    idealOutlier: 'Students with deep single-community impact rather than broad surface activities',
    overview: 'Yale strongly values community, character, and how you will contribute to their residential college system.',
    departmentNotes: 'Drama and arts programs weight creative portfolio heavily. Political science values student government or activism.',
    claimedValues: 'Leadership, scholarship, service, character',
    actualWeight: 'Depth of community engagement, authentic voice in essays, demonstrated ability to be a Yale residential college citizen',
    essayTip: 'The "Why Yale" essay must be hyper-specific. Name professors, programs, clubs, and explain the precise fit.',
    interviewCulture: 'Alumni interviews are conversational and relationship-focused. They want to see genuine curiosity about ideas.',
  },
  {
    name: 'University of Toronto',
    short: 'U of T',
    country: 'Canada',
    region: 'CANADA',
    score: 8.0,
    softSpot: 'Research experience + equity considerations',
    hiddenValue: 'Demonstrated capacity for independent scholarship',
    idealOutlier: 'Students from underrepresented backgrounds with research or publication experience',
    overview: 'U of T is one of the most research-intensive universities in North America and values early research exposure significantly.',
    departmentNotes: 'Rotman Commerce values business experience and competitions. Engineering weights co-op readiness.',
    claimedValues: 'Academic excellence, research, diversity',
    actualWeight: 'GPA + research exposure + letters of recommendation quality',
    essayTip: 'If you have any research experience, lead with it. If not, demonstrate research-mindedness through your subject interests.',
    interviewCulture: 'Program-specific. Rotman has a detailed interview process including case studies.',
  },
  {
    name: 'ETH Zurich',
    short: 'ETH',
    country: 'Switzerland',
    region: 'EUROPE',
    score: 7.6,
    softSpot: 'Technical aptitude tests + quantitative excellence',
    hiddenValue: 'Mathematical precision and independent study capacity',
    idealOutlier: 'Self-taught programmers or mathematicians with competition history',
    overview: 'ETH is Europe\'s MIT equivalent. Standards are extraordinarily high technically, but non-academic factors create meaningful differentiation.',
    departmentNotes: 'CS department weights competitive programming (Codeforces, ICPC). Architecture values portfolio innovation.',
    claimedValues: 'Technical excellence, innovation, international diversity',
    actualWeight: 'Technical test performance, mathematical Olympiad credentials, proven capacity for extreme self-direction',
    essayTip: 'Be precise and quantitative. Describe the specific technical domains you have mastered and how you measured your own progress.',
    interviewCulture: 'Technical and rigorous. Expect to solve problems, not just discuss interests.',
  },
  {
    name: 'National University of Singapore',
    short: 'NUS',
    country: 'Singapore',
    region: 'ASIA',
    score: 8.2,
    softSpot: 'Industry projects + leadership in student organizations',
    hiddenValue: 'Pragmatic application of knowledge to real systems',
    idealOutlier: 'Students with startup experience or industry internships pre-university',
    overview: 'NUS is Asia\'s highest-ranked university and attracts exceptional global talent. Holistic review considers leadership and global exposure.',
    departmentNotes: 'Computing school weights technical projects and internships. Business school values leadership roles and case competition wins.',
    claimedValues: 'Academic excellence, global outlook, innovation',
    actualWeight: 'Extracurricular leadership, internship or industry exposure, evidence of practical problem-solving',
    essayTip: 'Demonstrate awareness of Asian and global markets. Show how your interests connect to real-world impact in the region.',
    interviewCulture: 'Professional and structured. Expect to discuss your plans for post-graduation impact.',
  },
]

function UniversityModal({ uni, onClose, onTarget }) {
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-content" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ INSTITUTIONAL PROFILE ]</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '24px', color: 'var(--text-primary)', marginTop: '6px' }}>{uni.name}</h2>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)' }}>{uni.country}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'none', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {[
          ['OVERVIEW', uni.overview],
          ['DEPARTMENT NOTES', uni.departmentNotes],
          ['WHAT THEY CLAIM TO VALUE', uni.claimedValues],
          ['WHAT THEY ACTUALLY WEIGHT', uni.actualWeight],
          ['ESSAY INTELLIGENCE', uni.essayTip],
          ['INTERVIEW CULTURE', uni.interviewCulture],
        ].map(([label, val]) => (
          <div key={label} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--bg-border)' }}>
            <p className="label-tag" style={{ marginBottom: '8px' }}>{label}</p>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{val}</p>
          </div>
        ))}

        <button className="btn-primary" onClick={() => onTarget(uni)} style={{ width: '100%', justifyContent: 'center' }}>
          → TARGET THIS INSTITUTION
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function UniversityIntel({ onTarget }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const filtered = UNIVERSITIES.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.short.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || u.region === filter
    return matchSearch && matchFilter
  })

  return (
    <section id="university-intel" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-void)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} style={{ marginBottom: '48px' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ INSTITUTIONAL INTELLIGENCE ]</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
            KNOWN TARGETS
          </h2>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            className="input-dark"
            placeholder="SEARCH INSTITUTION DATABASE..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '40px', fontFamily: 'Space Mono, monospace', fontSize: '11px', letterSpacing: '0.08em' }}
          />
        </motion.div>

        {/* Filter chips */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.1em',
                padding: '6px 14px', border: '1px solid', borderRadius: '2px',
                background: filter === f ? 'var(--accent-acid)' : 'transparent',
                borderColor: filter === f ? 'var(--accent-acid)' : 'var(--bg-border)',
                color: filter === f ? 'var(--text-invert)' : 'var(--text-secondary)',
                cursor: 'none', transition: 'all 0.15s ease',
              }}
            >{f}</button>
          ))}
        </motion.div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--bg-border)' }}>
          {filtered.map((uni, i) => (
            <motion.div key={uni.short}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.05 }}
              className="card" style={{ borderRadius: 0, cursor: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>{uni.short}</h3>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{uni.country}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: '4px' }}>EXPLOITABILITY</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--accent-acid)' }}>[ {uni.score} ]</div>
                  <div className="exploit-bar" style={{ width: '60px', marginLeft: 'auto' }}>
                    <div className="exploit-fill" style={{ width: `${(uni.score / 10) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-acid)' }}>●</span> SOFT SPOT: {uni.softSpot}
                </p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-acid)' }}>●</span> HIDDEN VALUE: {uni.hiddenValue}
                </p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-acid)' }}>●</span> IDEAL OUTLIER: {uni.idealOutlier}
                </p>
              </div>

              <button className="btn-dark" onClick={() => setSelected(uni)} style={{ fontSize: '10px', padding: '8px 14px' }}>
                [ VIEW FULL INTEL → ]
              </button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
              [ NO INTEL AVAILABLE — BEGIN AUDIT ]
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <UniversityModal
            uni={selected}
            onClose={() => setSelected(null)}
            onTarget={(uni) => { onTarget(uni); setSelected(null); document.querySelector('#profile-builder')?.scrollIntoView({ behavior: 'smooth' }) }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
