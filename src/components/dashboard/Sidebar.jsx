import { useLocation, useNavigate } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'COMMAND CENTER', icon: '◆' },
  { path: '/dashboard/radar', label: 'ADMISSIONS RADAR', icon: '◎' },
  { path: '/dashboard/essays', label: 'ESSAY FORGE', icon: '✎' },
  { path: '/dashboard/activities', label: 'ACTIVITY OPS', icon: '▣' },
  { path: '/dashboard/colleges', label: 'COLLEGE LIST', icon: '▤' },
  { path: '/dashboard/testprep', label: 'TEST PREP', icon: '▧' },
  { path: '/dashboard/financial', label: 'FINANCIAL INTEL', icon: '◈' },
  { path: '/dashboard/architect', label: 'ARCHITECT AI', icon: '▶' },
  { path: '/dashboard/intel', label: 'INTEL DATABASE', icon: '◇' },
  { path: '/dashboard/interview', label: 'INTERVIEW PREP', icon: '◉' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { studentProfile, getMissionProgress } = useAppStore()
  const progress = getMissionProgress()

  const initials = studentProfile.name
    ? studentProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div style={{
      width: '220px',
      height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--bg-border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Student Info */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bg-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '1px solid var(--accent-acid)',
            background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '14px', color: 'var(--text-primary)',
            borderRadius: '2px', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              color: 'var(--text-primary)', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {studentProfile.name || 'OPERATIVE'}
            </p>
            <p style={{
              fontFamily: 'Space Mono, monospace', fontSize: '9px',
              color: 'var(--text-secondary)', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '0.08em',
            }}>
              {studentProfile.targetUniversity || studentProfile.dreamSchools?.[0] || 'NO TARGET SET'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 16px',
                border: 'none',
                borderLeft: active ? '2px solid var(--accent-acid)' : '2px solid transparent',
                background: active ? 'var(--bg-elevated)' : 'transparent',
                cursor: 'none',
                transition: 'all 0.15s ease',
                fontFamily: 'Space Mono, monospace',
                fontSize: '10px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active ? 'var(--accent-acid)' : 'var(--text-secondary)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span style={{ fontSize: '12px', width: '16px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Mission Progress */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--bg-border)' }}>
        <p style={{
          fontFamily: 'Space Mono, monospace', fontSize: '9px',
          color: 'var(--text-secondary)', letterSpacing: '0.1em',
          marginBottom: '8px',
        }}>
          MISSION PROGRESS
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{
            width: '6px', height: '100px',
            background: 'var(--bg-border)',
            borderRadius: '0',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', bottom: 0, width: '100%',
              height: `${progress}%`,
              background: 'var(--accent-acid)',
              transition: 'height 0.5s ease',
            }} />
          </div>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            color: 'var(--accent-acid)', letterSpacing: '0.05em',
          }}>
            [ {progress}% COMPLETE ]
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--bg-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button style={{
          background: 'none', border: 'none', cursor: 'none',
          color: 'var(--text-tertiary)', padding: '4px',
          display: 'flex', alignItems: 'center',
        }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-acid)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <Settings size={14} />
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'none',
            fontFamily: 'Space Mono, monospace', fontSize: '9px',
            color: 'var(--text-tertiary)', letterSpacing: '0.1em',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-acid)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <LogOut size={12} /> LOG OUT
        </button>
      </div>
    </div>
  )
}
