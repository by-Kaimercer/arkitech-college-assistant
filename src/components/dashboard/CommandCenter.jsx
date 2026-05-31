import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

function RadialScore({ score, size = 120 }) {
  const r = (size - 12) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-border)" strokeWidth="3" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--accent-acid)" strokeWidth="3" strokeLinecap="butt"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
}

export default function CommandCenter() {
  const navigate = useNavigate()
  const {
    getProfileLeverageScore, collegeList, essays, tasks, toggleTask,
    getDailyTip, getDaysToDeadline,
  } = useAppStore()

  const leverageScore = getProfileLeverageScore()
  const daysToDeadline = getDaysToDeadline()
  const incompleteTasks = tasks.filter((t) => !t.done)
  const completedTasks = tasks.filter((t) => t.done)

  const stats = [
    {
      label: 'PROFILE LEVERAGE SCORE',
      value: leverageScore,
      render: (
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <RadialScore score={leverageScore} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <motion.span
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '36px', color: 'var(--accent-acid)', lineHeight: 1 }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            >
              {leverageScore}
            </motion.span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>/ 100</span>
          </div>
        </div>
      ),
    },
    {
      label: 'SCHOOLS TRACKED',
      value: collegeList.length,
      render: (
        <motion.span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '48px', color: 'var(--text-primary)', lineHeight: 1 }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
        >
          {collegeList.length}
        </motion.span>
      ),
    },
    {
      label: 'ESSAYS IN PROGRESS',
      value: essays.length,
      render: (
        <motion.span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '48px', color: 'var(--text-primary)', lineHeight: 1 }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.7 }}
        >
          {essays.length}
        </motion.span>
      ),
    },
    {
      label: 'DAYS TO EARLIEST DEADLINE',
      value: daysToDeadline,
      render: (
        <motion.span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '48px', lineHeight: 1,
          color: daysToDeadline !== null && daysToDeadline < 30 ? 'var(--accent-red)' : 'var(--text-primary)',
        }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
        >
          {daysToDeadline !== null ? daysToDeadline : '—'}
        </motion.span>
      ),
    },
  ]

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '32px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ COMMAND CENTER — MISSION OVERVIEW ]</span>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 900,
          fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)',
          marginTop: '4px', letterSpacing: '-0.02em',
        }}>
          OPERATIONS DASHBOARD
        </h1>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', marginBottom: '32px', overflow: 'hidden' }}>
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={fadeUp} initial="initial" animate="animate"
            style={{
              background: 'var(--bg-surface)',
              padding: '24px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px', textAlign: 'center',
            }}
          >
            {stat.render}
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Active Missions */}
      <motion.div custom={4} variants={fadeUp} initial="initial" animate="animate"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', marginBottom: '24px' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ ACTIVE MISSIONS ]</span>
        </div>
        <div>
          {incompleteTasks.map((task) => (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 20px',
              borderBottom: '1px solid var(--bg-border)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <button onClick={() => toggleTask(task.id)} style={{
                width: '20px', height: '20px', flexShrink: 0,
                border: '1px solid var(--bg-border)', borderRadius: '2px',
                background: 'transparent', cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)' }}>{task.label}</p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>{task.sub}</p>
              </div>
              <button className="btn-dark" onClick={() => navigate(task.module)} style={{ fontSize: '9px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                START <ChevronRight size={10} />
              </button>
            </div>
          ))}
          {incompleteTasks.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-acid)' }}>[ ALL MISSIONS COMPLETE ]</p>
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <details style={{ borderTop: '1px solid var(--bg-border)' }}>
            <summary style={{
              padding: '12px 20px', cursor: 'none',
              fontFamily: 'Space Mono, monospace', fontSize: '10px',
              color: 'var(--text-tertiary)', letterSpacing: '0.1em',
              listStyle: 'none',
            }}>
              ▾ COMPLETED INTEL ({completedTasks.length})
            </summary>
            {completedTasks.map((task) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '10px 20px', opacity: 0.5,
                borderBottom: '1px solid var(--bg-border)',
              }}>
                <div style={{
                  width: '20px', height: '20px', flexShrink: 0,
                  background: 'var(--accent-acid)', borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="var(--text-invert)" />
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{task.label}</p>
              </div>
            ))}
          </details>
        )}
      </motion.div>

      {/* Architect Briefing */}
      <motion.div custom={5} variants={fadeUp} initial="initial" animate="animate"
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
          borderRadius: '4px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--accent-acid)', letterSpacing: '0.1em', flexShrink: 0 }}>
          [ ARCHITECT SAYS ]
        </span>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
          {getDailyTip()}
        </p>
        <button className="btn-dark" onClick={() => navigate('/dashboard/architect')} style={{ fontSize: '9px', padding: '6px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ASK ARCHITECT <ChevronRight size={10} />
        </button>
      </motion.div>

      {/* School Status Board */}
      <motion.div custom={6} variants={fadeUp} initial="initial" animate="animate"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ SCHOOL STATUS BOARD ]</span>
        </div>

        {collegeList.length > 0 ? (
          <div>
            {collegeList.slice(0, 6).map((school) => (
              <div key={school.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 20px',
                borderBottom: '1px solid var(--bg-border)',
              }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>
                  {school.name}
                </span>
                <span style={{
                  fontFamily: 'Space Mono, monospace', fontSize: '9px',
                  padding: '3px 8px', borderRadius: '100px', letterSpacing: '0.08em',
                  background: school.type === 'REACH' ? 'rgba(255,59,48,0.15)' : school.type === 'SAFETY' ? 'rgba(52,199,89,0.15)' : 'rgba(245,166,35,0.15)',
                  color: school.type === 'REACH' ? '#ff3b30' : school.type === 'SAFETY' ? '#34c759' : '#f5a623',
                }}>
                  {school.type}
                </span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', minWidth: '90px' }}>
                  {school.status}
                </span>
                {school.odds && (
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--accent-acid)' }}>
                    {school.odds}%
                  </span>
                )}
                <button className="btn-dark" onClick={() => navigate('/dashboard/colleges')} style={{ fontSize: '9px', padding: '4px 10px' }}>
                  OPEN <ChevronRight size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            border: '1px dashed var(--bg-border)', borderRadius: '4px',
            margin: '16px',
          }}>
            <button className="btn-ghost" onClick={() => navigate('/dashboard/colleges')} style={{ fontSize: '11px' }}>
              [ NO TARGETS ACQUIRED — BUILD YOUR LIST → ]
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
