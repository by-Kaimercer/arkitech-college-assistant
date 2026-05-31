import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'SYSTEM', href: '#how-it-works' },
  { label: 'TARGETS', href: '#university-intel' },
  { label: 'PROTOCOL', href: '#profile-builder' },
  { label: 'INTEL', href: '#essay-workshop' },
]

export default function Navbar({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(8,8,8,0.92)' : 'rgba(8,8,8,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid var(--bg-border)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          padding: '0 24px',
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={e => scrollTo(e, '#hero')}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0 }}
        >
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '18px', letterSpacing: '0.05em' }}>
            <span style={{ color: 'var(--accent-acid)' }}>[</span>
            <span style={{ color: 'var(--text-primary)', margin: '0 6px' }}>ARCHITECT</span>
            <span style={{ color: 'var(--accent-acid)' }}>]</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', gap: '32px' }} className="hidden-mobile">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={e => scrollTo(e, link.href)}
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-acid)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="hidden-mobile">
          <button className="btn-ghost" style={{ fontSize: '11px', padding: '8px 16px' }}>
            LOG IN
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: '12px', padding: '8px 18px' }}
            onClick={e => { e.preventDefault(); document.querySelector('#profile-builder')?.scrollIntoView({ behavior: 'smooth' }) }}
          >
            DEPLOY NOW →
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-primary)',
            cursor: 'none', padding: '8px', display: 'none'
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => scrollTo(e, link.href)}
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '13px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--bg-border)',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              DEPLOY NOW →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </>
  )
}
