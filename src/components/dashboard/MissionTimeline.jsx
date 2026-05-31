import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Lock, Check, Play } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const PHASES = [
  {
    id: 1,
    label: 'RECONNAISSANCE',
    sub: 'Build your academic dossier and identify targets',
    taskIds: ['t1'],
    icon: '◎',
  },
  {
    id: 2,
    label: 'TARGET ACQUISITION',
    sub: 'Run admissions radar and build college list',
    taskIds: ['t2', 't5'],
    icon: '◆',
  },
  {
    id: 3,
    label: 'NARRATIVE ENGINEERING',
    sub: 'Draft and refine your personal statement',
    taskIds: ['t3'],
    icon: '✎',
  },
  {
    id: 4,
    label: 'PROFILE OPTIMIZATION',
    sub: 'Optimize extracurriculars and spike positioning',
    taskIds: ['t4'],
    icon: '▣',
  },
  {
    id: 5,
    label: 'SCORE CALIBRATION',
    sub: 'Predict and plan standardized test strategy',
    taskIds: ['t6'],
    icon: '▧',
  },
  {
    id: 6,
    label: 'FINANCIAL RECON',
    sub: 'Estimate aid and identify scholarship targets',
    taskIds: ['t7'],
    icon: '◈',
  },
  {
    id: 7,
    label: 'DEPLOYMENT',
    sub: 'Final review, interview prep, and submission',
    taskIds: [],
    icon: '▶',
  },
]

function getPhaseStatus(phase, tasks, previousComplete) {
  if (phase.taskIds.length === 0) {
    // Deployment phase — unlocked only when all others are complete
    return previousComplete ? 'ACTIVE' : 'LOCKED'
  }
  const phaseTasks = tasks.filter((t) => phase.taskIds.includes(t.id))
  const allDone = phaseTasks.length > 0 && phaseTasks.every((t) => t.done)
  if (allDone) return 'COMPLETE'
  if (previousComplete) return 'ACTIVE'
  return 'LOCKED'
}

function getDateForPhase(phaseIndex, earliestDeadline, totalPhases) {
  if (!earliestDeadline) return null
  const now = Date.now()
  const total = earliestDeadline - now
  if (total <= 0) return null
  const phaseSpan = total / totalPhases
  const phaseDate = new Date(now + phaseSpan * phaseIndex)
  return phaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MissionTimeline() {
  const [collapsed, setCollapsed] = useState(false)
  const { tasks, collegeList } = useAppStore()

  const earliestDeadline = useMemo(() => {
    const deadlines = collegeList
      .filter((c) => c.deadline)
      .map((c) => new Date(c.deadline).getTime())
    if (deadlines.length === 0) return null
    return Math.min(...deadlines)
  }, [collegeList])

  const phases = useMemo(() => {
    let previousComplete = true
    return PHASES.map((phase, i) => {
      const status = getPhaseStatus(phase, tasks, previousComplete)
      const targetDate = getDateForPhase(i, earliestDeadline, PHASES.length)
      if (status !== 'COMPLETE') previousComplete = false
      return { ...phase, status, targetDate }
    })
  }, [tasks, earliestDeadline])

  const completedCount = phases.filter((p) => p.status === 'COMPLETE').length
  const progressPct = Math.round((completedCount / phases.length) * 100)

  return (
    <div style={{
      position: 'relative',
      width: collapsed ? '40px' : '280px',
      transition: 'width 0.3s ease',
      borderLeft: '1px solid var(--bg-border)',
      background: 'var(--bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          top: '12px',
          left: collapsed ? '8px' : '12px',
          background: 'none',
          border: '1px solid var(--bg-border)',
          borderRadius: '4px',
          color: 'var(--text-secondary)',
          cursor: 'none',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-acid)'
          e.currentTarget.style.color = 'var(--accent-acid)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--bg-border)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
      >
        {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Collapsed: just show vertical progress bar */}
      {collapsed && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0 16px',
        }}>
          <div style={{
            width: '4px',
            flex: 1,
            background: 'var(--bg-border)',
            borderRadius: '0',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: `${progressPct}%`,
              background: 'var(--accent-acid)',
              transition: 'height 0.5s ease',
            }} />
          </div>
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '9px',
            color: 'var(--accent-acid)',
            letterSpacing: '0.1em',
            marginTop: '8px',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}>
            {progressPct}%
          </span>
        </div>
      )}

      {/* Expanded: full timeline */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 16px 12px 44px',
              borderBottom: '1px solid var(--bg-border)',
            }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', fontSize: '9px' }}>
                [ MISSION TIMELINE ]
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '6px',
              }}>
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: 'var(--bg-border)',
                  borderRadius: '0',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    background: 'var(--accent-acid)',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--accent-acid)',
                  lineHeight: 1,
                }}>
                  {progressPct}%
                </span>
              </div>
            </div>

            {/* Timeline nodes */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}>
              {phases.map((phase, i) => {
                const isComplete = phase.status === 'COMPLETE'
                const isActive = phase.status === 'ACTIVE'
                const isLocked = phase.status === 'LOCKED'

                return (
                  <div key={phase.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    {/* Vertical line */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                      width: '20px',
                    }}>
                      {/* Node */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isComplete
                          ? '2px solid var(--accent-acid)'
                          : isActive
                            ? '2px solid var(--accent-acid)'
                            : '1px solid var(--bg-border)',
                        background: isComplete
                          ? 'var(--accent-acid)'
                          : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        ...(isActive && { animation: 'pulse-anim 1.5s ease-in-out infinite' }),
                      }}>
                        {isComplete && <Check size={10} color="var(--text-invert)" />}
                        {isActive && <Play size={7} color="var(--accent-acid)" style={{ marginLeft: '1px' }} />}
                        {isLocked && <Lock size={8} color="var(--text-tertiary)" />}
                      </div>
                      {/* Connector line */}
                      {i < phases.length - 1 && (
                        <div style={{
                          width: '1px',
                          flex: 1,
                          minHeight: '24px',
                          background: isComplete ? 'var(--accent-acid)' : 'var(--bg-border)',
                          transition: 'background 0.3s ease',
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{
                      paddingBottom: i < phases.length - 1 ? '20px' : '0',
                      flex: 1,
                      opacity: isLocked ? 0.4 : 1,
                      transition: 'opacity 0.3s ease',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '2px',
                      }}>
                        <span style={{
                          fontFamily: 'Space Mono, monospace',
                          fontSize: '8px',
                          letterSpacing: '0.1em',
                          color: isComplete
                            ? 'var(--accent-acid)'
                            : isActive
                              ? 'var(--accent-acid)'
                              : 'var(--text-tertiary)',
                        }}>
                          {String(phase.id).padStart(2, '0')}
                        </span>
                        <span style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 700,
                          fontSize: '11px',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          letterSpacing: '0.02em',
                        }}>
                          {phase.label}
                        </span>
                      </div>

                      <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '4px',
                      }}>
                        {phase.sub}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        {/* Status badge */}
                        <span style={{
                          fontFamily: 'Space Mono, monospace',
                          fontSize: '8px',
                          letterSpacing: '0.1em',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          background: isComplete
                            ? 'rgba(200, 241, 53, 0.12)'
                            : isActive
                              ? 'rgba(200, 241, 53, 0.06)'
                              : 'transparent',
                          border: `1px solid ${isComplete ? 'var(--accent-acid)' : isActive ? 'rgba(200, 241, 53, 0.3)' : 'var(--bg-border)'}`,
                          color: isComplete
                            ? 'var(--accent-acid)'
                            : isActive
                              ? 'var(--accent-acid)'
                              : 'var(--text-tertiary)',
                        }}>
                          {phase.status}
                        </span>

                        {/* Target date */}
                        {phase.targetDate && (
                          <span style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '9px',
                            color: 'var(--text-tertiary)',
                          }}>
                            ≤ {phase.targetDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--bg-border)',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
              }}>
                {completedCount}/{phases.length} PHASES COMPLETE
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
