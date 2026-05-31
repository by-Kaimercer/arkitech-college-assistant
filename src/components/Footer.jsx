import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MessageCircle, ExternalLink } from 'lucide-react'

// Social icon placeholders using text since some lucide icons were renamed
const socialIcons = [
  { label: 'X', symbol: '𝕏' },
  { label: 'Instagram', symbol: '◎' },
  { label: 'Discord', symbol: '⊕' },
  { label: 'LinkedIn', symbol: '⊞' },
]

const TICKER_TEXT = 'STANFORD · OXFORD · MIT · IMPERIAL · LSE · COLUMBIA · YALE · UCL · EDINBURGH · TORONTO · NUS · ETH ZURICH · CAMBRIDGE · NYU · '

const LINKS = ['About', 'Privacy', 'Terms', 'API', 'Blog']

export default function Footer() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <footer ref={ref} style={{ background: 'var(--bg-void)', borderTop: '1px solid var(--bg-border)' }}>
      {/* Reverse ticker */}
      <div className="ticker-wrap">
        <div className="ticker-content-reverse">
          {TICKER_TEXT.repeat(4)}
        </div>
      </div>

      {/* Main footer content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', alignItems: 'start' }}
      >
        {/* Left: Logo + tagline */}
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '20px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--accent-acid)' }}>[</span>
            <span style={{ color: 'var(--text-primary)', margin: '0 8px' }}>ARCHITECT</span>
            <span style={{ color: 'var(--accent-acid)' }}>]</span>
          </div>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.08em', lineHeight: 1.7 }}>
            Tactical Intelligence.<br />Strategic Placement.
          </p>
        </div>

        {/* Center: Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', justifyContent: 'center' }}>
          {LINKS.map(l => (
            <a key={l} href="#"
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-acid)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>

        {/* Right: Social icons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          {socialIcons.map(({ label, symbol }) => (
            <a key={label} href="#" title={label}
              style={{
                color: 'var(--text-secondary)', transition: 'color 0.2s',
                fontFamily: 'Space Mono, monospace', fontSize: '14px',
                textDecoration: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-acid)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {symbol}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Bottom strip */}
      <div style={{ borderTop: '1px solid var(--bg-border)', padding: '20px 24px', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-tertiary)', letterSpacing: '0.12em', textAlign: 'center' }}>
          © 2025 ARCHITECT — BUILT FOR STUDENTS WHO REFUSE TO BE AVERAGE
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
          footer .social-row { justify-content: center !important; }
        }
      `}</style>
    </footer>
  )
}
