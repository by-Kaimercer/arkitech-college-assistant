import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const TESTIMONIALS = [
  {
    name: 'Arjun M.',
    school: 'UCL',
    course: 'Economics',
    gpa: 'B / 3.2 GPA',
    type: 'SPIKE DOMINANT',
    quote: 'I published a paper on microfinance at 17. ARCHITECT helped me lead with that instead of apologizing for my grades.',
  },
  {
    name: 'Sofia K.',
    school: 'Imperial College',
    course: 'Bioengineering',
    gpa: 'C in Chemistry',
    type: 'NARRATIVE REFRAME',
    quote: 'My weakness was actually my angle. Three internships at biotech firms. ARCHITECT rebuilt my story from the ground up.',
  },
  {
    name: 'James T.',
    school: 'Columbia',
    course: 'Computer Science',
    gpa: 'B+ average',
    type: 'BUILDER PROFILE',
    quote: 'I had shipped two apps with 10k users. ARCHITECT showed me how that was more valuable than any A in calculus.',
  },
  {
    name: 'Priya R.',
    school: 'LSE',
    course: 'Philosophy & Economics',
    gpa: 'B / Mixed grades',
    type: 'CONTRARIAN PIVOT',
    quote: 'The reframe was brutal and exactly right. I stopped explaining myself and started presenting my thesis instead.',
  },
  {
    name: 'Marcus D.',
    school: 'University of Toronto',
    course: 'Political Science',
    gpa: '2.8 GPA',
    type: 'CIVIC SPIKE',
    quote: 'My community organizing work had real numbers behind it — 3 campaigns, 200 volunteers. ARCHITECT made that the headline.',
  },
  {
    name: 'Yuki H.',
    school: 'ETH Zurich',
    course: 'Computer Science',
    gpa: 'Average maths score',
    type: 'COMPETITION TRACK',
    quote: 'ICPC regional finalist. ARCHITECT said lead with that. Three lines into my essay and ETH was already interested.',
  },
  {
    name: 'Chioma A.',
    school: 'Stanford',
    course: 'Human-Computer Interaction',
    gpa: '3.4 GPA',
    type: 'IMPACT ARCHITECT',
    quote: 'My fintech startup had 400 active users in Lagos. ARCHITECT turned that into a systems-level argument for Stanford.',
  },
  {
    name: 'Lena B.',
    school: 'Oxford',
    course: 'PPE',
    gpa: 'B in Economics',
    type: 'INTELLECTUAL DEPTH',
    quote: 'I had read 12 economics papers outside my syllabus. ARCHITECT told me to cite every single one. Interview: offered.',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="testimonials" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} style={{ marginBottom: '48px' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ FIELD REPORTS — VERIFIED OUTCOMES ]</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
            PROFILES THAT DEFIED<br />THE ALGORITHM
          </h2>
        </motion.div>

        {/* Horizontal scrolling ticker */}
        <div style={{ overflow: 'hidden', marginBottom: '48px', borderTop: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)', padding: '24px 0' }}>
          <div style={{ display: 'flex', gap: '16px', animation: 'ticker-left 40s linear infinite', width: 'max-content' }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="testimonial-card" style={{ minWidth: '300px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)' }}>{t.name}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>· {t.course}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{t.gpa}</span>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--accent-acid)', marginBottom: '12px' }}>
                  → ACCEPTED: {t.school}
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                  "{t.quote}"
                </p>
                <span className="tag-chip">[ PROFILE TYPE: {t.type} ]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured large cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.08 }}
              className="card" style={{ borderRadius: 0, border: 'none' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>{t.name}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px', letterSpacing: '0.05em' }}>· {t.course}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'line-through', marginRight: '12px' }}>{t.gpa}</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '22px', color: 'var(--accent-acid)', marginBottom: '20px', lineHeight: 1.2 }}>
                → ACCEPTED:<br />{t.school.toUpperCase()}
              </div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px', borderLeft: '2px solid var(--bg-border)', paddingLeft: '16px' }}>
                "{t.quote}"
              </p>
              <span className="tag-chip">[ PROFILE TYPE: {t.type} ]</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
