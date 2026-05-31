import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const phases = [
  {
    num: '01',
    phase: 'PHASE 01',
    title: 'INSTITUTIONAL VULNERABILITY AUDIT',
    body: 'We decode what each specific department secretly values — the hidden soft spots in their process where GPA matters least. Every institution has a code. We find it.',
    tags: ['RESEARCH', 'INTEL', 'TARGETING'],
  },
  {
    num: '02',
    phase: 'PHASE 02',
    title: 'NARRATIVE DOMINANCE',
    body: "Your low grades become a deliberate trade-off. We identify your 'Spikes' — 2-3 areas where you appear in the top 1% — and engineer a profile no committee can ignore.",
    tags: ['POSITIONING', 'SPIKE BUILD', 'REFRAME'],
  },
  {
    num: '03',
    phase: 'PHASE 03',
    title: 'THE EXECUTION BLUEPRINT',
    body: 'Tactical guides for your personal statement, CV, and interview. Specific psychological framing to trigger the exact response from admissions officers.',
    tags: ['ESSAY', 'CV', 'INTERVIEW'],
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-void)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '16px' }}
        >
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ OPERATIONAL PROTOCOL ]</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glitch-hover"
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(32px, 5vw, 56px)',
            textAlign: 'center',
            color: 'var(--text-primary)',
            marginBottom: '64px',
            letterSpacing: '-0.02em',
          }}
        >
          THE INFILTRATION FRAMEWORK
        </motion.h2>

        {/* Phase Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1px',
          border: '1px solid var(--bg-border)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          {phases.map((phase, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              style={{ borderRadius: 0, border: 'none', borderRight: i < 2 ? '1px solid var(--bg-border)' : 'none' }}
            >
              {/* Ghost number */}
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 900,
                fontSize: '80px',
                color: 'rgba(200, 241, 53, 0.08)',
                lineHeight: 1,
                marginBottom: '-20px',
                letterSpacing: '-0.04em',
              }}>
                {phase.num}
              </div>

              <span className="phase-badge" style={{ display: 'block', marginBottom: '12px' }}>
                {phase.phase}
              </span>

              <h3 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--text-primary)',
                marginBottom: '16px',
                lineHeight: 1.3,
              }}>
                {phase.title}
              </h3>

              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '24px',
              }}>
                {phase.body}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {phase.tags.map(tag => (
                  <span key={tag} className="tag-chip">[ {tag} ]</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mono divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          style={{ textAlign: 'center', marginTop: '48px' }}
        >
          <p style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.15em',
          }}>
            NOT SMARTER. MORE STRATEGIC.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
