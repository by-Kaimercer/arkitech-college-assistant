import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import NotificationBell from './NotificationBell'
import MissionTimeline from './MissionTimeline'
import { useAppStore } from '../../store/useAppStore'

export default function DashboardLayout() {
  const location = useLocation()
  const { onboardingComplete, sessionRestored, setSessionRestored } = useAppStore()
  const [showToast, setShowToast] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 769
    return true
  })

  useEffect(() => {
    if (onboardingComplete && !sessionRestored) {
      setSessionRestored(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-void)',
    }}>
      {/* Sidebar — desktop */}
      <div className="dashboard-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Main Content + Timeline */}
      <div style={{
        flex: 1,
        marginLeft: '220px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
        className="dashboard-main-content"
      >
        {/* Top Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 20px',
          borderBottom: '1px solid var(--bg-border)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <button
            className="dashboard-timeline-toggle"
            onClick={() => setTimelineOpen(!timelineOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--bg-border)',
              borderRadius: '4px',
              padding: '4px 10px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: timelineOpen ? 'var(--accent-acid)' : 'var(--text-secondary)',
              cursor: 'none',
              transition: 'all 0.2s ease',
              borderColor: timelineOpen ? 'var(--accent-acid)' : 'var(--bg-border)',
            }}
          >
            [ TIMELINE ]
          </button>
          <NotificationBell />
        </div>

        {/* Content + Timeline row */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Page content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ flex: 1 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mission Timeline — right panel */}
          {timelineOpen && (
            <div className="dashboard-timeline-panel">
              <MissionTimeline />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Session Restored Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '16px', right: '16px', zIndex: 9000,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent-acid)',
              borderRadius: '4px',
              padding: '12px 20px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '11px',
              color: 'var(--accent-acid)',
              letterSpacing: '0.08em',
            }}
          >
            [ SESSION RESTORED — WELCOME BACK ]
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .dashboard-sidebar-desktop {
          position: fixed;
          left: 0;
          top: 0;
          width: 220px;
          height: 100vh;
          z-index: 100;
        }
        .mobile-bottom-nav {
          display: none;
        }
        .dashboard-timeline-panel {
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .dashboard-sidebar-desktop {
            display: none;
          }
          .dashboard-main-content {
            margin-left: 0 !important;
            padding-bottom: 72px;
          }
          .mobile-bottom-nav {
            display: flex !important;
          }
          .dashboard-timeline-toggle {
            display: none !important;
          }
          .dashboard-timeline-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

function MobileNav() {
  const location = useLocation()
  const tabs = [
    { path: '/dashboard', label: 'HOME', icon: '◆' },
    { path: '/dashboard/radar', label: 'RADAR', icon: '◎' },
    { path: '/dashboard/essays', label: 'ESSAYS', icon: '✎' },
    { path: '/dashboard/colleges', label: 'LIST', icon: '▤' },
    { path: '/dashboard/architect', label: 'AI', icon: '▶' },
  ]

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '64px',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--bg-border)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 200,
    }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <a key={tab.path} href={tab.path} style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '8px 12px',
            minWidth: '48px',
          }}>
            <span style={{ fontSize: '18px', color: active ? 'var(--accent-acid)' : 'var(--text-tertiary)' }}>{tab.icon}</span>
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: '8px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: active ? 'var(--accent-acid)' : 'var(--text-tertiary)',
            }}>{tab.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
