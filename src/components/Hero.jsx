import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Play } from 'lucide-react'

const TICKER_TEXT = 'STANFORD · OXFORD · MIT · IMPERIAL · LSE · COLUMBIA · YALE · UCL · EDINBURGH · TORONTO · NUS · ETH ZURICH · CAMBRIDGE · NYU · '

const stats = [
  '[ 94% acceptance uplift ]',
  '[ 2,400+ profiles optimized ]',
  '[ 180+ universities decoded ]',
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
  })
}

export default function Hero() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const scrollToProfile = () => {
    document.querySelector('#profile-builder')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg-void)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: '64px',
      }}
    >
      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Circle decoration */}
      <div className="circle-deco" style={{
        width: '700px', height: '700px',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>

        {/* Top label */}
        <motion.div
          custom={0} variants={fadeUp}
          initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}
        >
          <span className="pulse-dot" />
          <span className="label-tag">[ ADMISSIONS INTELLIGENCE SYSTEM v2.1 ]</span>
        </motion.div>

        {/* Main headline */}
        <div style={{ marginBottom: '32px' }}>
          {[
            { text: 'YOUR GRADES', delay: 1 },
            { text: "DON'T DEFINE", delay: 2 },
            { text: 'YOUR DESTINY.', delay: 3 },
            { text: null, delay: 4 }, // special line
          ].map((line, i) => (
            line.text ? (
              <motion.h1
                key={i}
                custom={line.delay} variants={fadeUp}
                initial="hidden" animate={inView ? "visible" : "hidden"}
                className="glitch-hover"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(42px, 8vw, 88px)',
                  lineHeight: 1.0,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {line.text}
              </motion.h1>
            ) : (
              <motion.h1
                key={i}
                custom={line.delay} variants={fadeUp}
                initial="hidden" animate={inView ? "visible" : "hidden"}
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(42px, 8vw, 88px)',
                  lineHeight: 1.0,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                YOUR <span style={{ color: 'var(--accent-acid)' }} className="glitch-hover">STRATEGY</span> DOES.
              </motion.h1>
            )
          ))}
        </div>

        {/* Subtext */}
        <motion.p
          custom={5} variants={fadeUp}
          initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '15px',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            marginBottom: '40px',
          }}
        >
          ARCHITECT is an AI-powered admissions strategist that transforms an average student profile into an irresistible application. Clinical. Tactical. Ruthlessly effective.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={6} variants={fadeUp}
          initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}
        >
          <button className="btn-primary" onClick={scrollToProfile} style={{ fontSize: '14px', padding: '14px 28px' }}>
            → BEGIN YOUR INFILTRATION
          </button>
          <button className="btn-dark" style={{ gap: '8px' }}>
            <Play size={14} />
            WATCH THE PROTOCOL
          </button>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          custom={7} variants={fadeUp}
          initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
        >
          {stats.map((s, i) => (
            <span key={i} className="stat-pill">{s}</span>
          ))}
        </motion.div>
      </div>

      {/* Ticker */}
      <div className="ticker-wrap" style={{ marginTop: '40px', position: 'relative', zIndex: 1 }}>
        <div className="ticker-content">
          {TICKER_TEXT.repeat(4)}
        </div>
      </div>
    </section>
  )
}
