import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send, X } from 'lucide-react'
import { useArchitectChat } from '../hooks/useArchitectChat'

function TypewriterText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text])
  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}</span>
}

function MessageContent({ content, isFirst, streaming }) {
  if (isFirst) return <TypewriterText text={content} speed={12} />
  return <span style={{ whiteSpace: 'pre-wrap' }}>{content}{streaming ? <span style={{ color: 'var(--accent-acid)', animation: 'pulse-anim 1s infinite' }}>▋</span> : null}</span>
}

export default function ArchitectChat({ dossierContext, onClearDossier }) {
  const {
    messages, isLoading, sendMessage, clearSession,
    profileStrength, currentPhase, currentMission
  } = useArchitectChat()

  const [input, setInput] = useState('')
  const [dossierSent, setDossierSent] = useState(false)
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send dossier if provided
  useEffect(() => {
    if (dossierContext && !dossierSent) {
      setDossierSent(true)
      sendMessage('I have submitted my dossier. Please review it and begin the strategic audit.', dossierContext)
    }
  }, [dossierContext])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const phaseStatuses = [
    { label: 'PHASE 01 — INSTITUTIONAL AUDIT', active: currentPhase >= 1 },
    { label: 'PHASE 02 — STRATEGIC FRAMING', active: currentPhase >= 2 },
    { label: 'PHASE 03 — EXECUTION', active: currentPhase >= 3 },
  ]

  return (
    <section id="architect-chat" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-void)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          style={{ marginBottom: '48px' }}
        >
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ LIVE SYSTEM ]</span>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 900,
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: 'var(--text-primary)', marginTop: '8px',
            letterSpacing: '-0.02em',
          }}>
            DEPLOY THE <span style={{ color: 'var(--accent-acid)' }}>ARCHITECT</span>
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>

          {/* LEFT: Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ background: 'var(--bg-surface)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}
          >
            {/* Status header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="pulse-dot" />
                <span style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)'
                }}>ARCHITECT ACTIVE</span>
              </div>

              {/* Phase statuses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {phaseStatuses.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: p.active ? 'var(--accent-acid)' : 'var(--bg-border)',
                      flexShrink: 0,
                      ...(p.active && { animation: 'pulse-anim 1.5s infinite' }),
                    }} />
                    <span style={{
                      fontFamily: 'Space Mono, monospace', fontSize: '10px',
                      letterSpacing: '0.1em',
                      color: p.active ? 'var(--accent-acid)' : 'var(--text-tertiary)',
                    }}>
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Leverage */}
            <div>
              <p className="label-tag" style={{ marginBottom: '12px' }}>PROFILE LEVERAGE</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="strength-meter-track">
                  <div className="strength-meter-fill" style={{ height: `${profileStrength}%` }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 900,
                    fontSize: '40px', color: 'var(--accent-acid)', lineHeight: 1,
                  }}>
                    {profileStrength}
                  </div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                    / 100
                  </div>
                </div>
              </div>
            </div>

            {/* Target card */}
            <div style={{
              border: dossierContext ? '1px solid var(--bg-border)' : '1px dashed var(--bg-border)',
              borderRadius: '4px',
              padding: '16px',
            }}>
              <p className="label-tag" style={{ marginBottom: '8px' }}>CURRENT TARGET</p>
              {dossierContext ? (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)' }}>
                  Dossier loaded. Target acquired.
                </p>
              ) : (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  [ NO TARGET SELECTED ]
                </p>
              )}
            </div>

            {/* Current mission */}
            <div>
              <p className="label-tag" style={{ marginBottom: '8px' }}>CURRENT MISSION</p>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '11px',
                color: 'var(--accent-acid)', letterSpacing: '0.05em',
              }}>
                ▶ {currentMission}
              </p>
            </div>

            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '11px',
              color: 'var(--text-tertiary)', lineHeight: 1.7,
              borderTop: '1px solid var(--bg-border)', paddingTop: '20px',
            }}>
              ARCHITECT uses institutional intelligence to find the exact gaps in each university&apos;s armor. Input your target to begin.
            </p>
          </motion.div>

          {/* RIGHT: Chat interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15 }}
            style={{
              background: 'var(--bg-surface)',
              display: 'flex', flexDirection: 'column',
              height: '620px', position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Scanlines */}
            <div className="scanlines" style={{ zIndex: 0 }} />

            {/* Chat top bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--bg-border)',
              position: 'relative', zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)'
                }}>ARCHITECT_AI</span>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
              </div>
              <button
                className="btn-dark"
                style={{ fontSize: '10px', padding: '6px 12px' }}
                onClick={clearSession}
              >
                <X size={12} />
                CLEAR SESSION
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '20px',
              position: 'relative', zIndex: 2,
            }}>
              {messages.map((msg, i) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  {msg.role === 'assistant' ? (
                    <div style={{ maxWidth: '100%' }}>
                      <div className="chat-ai-label">[ ARCHITECT ]</div>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '13px',
                        color: 'var(--text-primary)', lineHeight: 1.8,
                      }}>
                        <MessageContent
                          content={msg.content}
                          isFirst={i === 0 && msg.id === 'init'}
                          streaming={msg.streaming}
                        />
                      </p>
                    </div>
                  ) : (
                    <div className="chat-user-bubble">{msg.content}</div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div>
                  <div className="chat-ai-label">[ ARCHITECT ]</div>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--accent-acid)' }}>
                    [ ARCHITECT PROCESSING
                    <span style={{ animation: 'none' }}>...</span> ]
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{
              borderTop: '1px solid var(--bg-border)',
              padding: '16px 20px',
              background: 'var(--bg-elevated)',
              position: 'relative', zIndex: 2,
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="State your target institution..."
                  rows={1}
                  className="input-dark"
                  style={{ resize: 'none', lineHeight: '1.6', maxHeight: '120px', flex: 1 }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  style={{
                    width: '40px', height: '40px', flexShrink: 0,
                    background: input.trim() ? 'var(--accent-acid)' : 'var(--bg-border)',
                    border: 'none', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: input.trim() ? 'none' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Send size={16} color={input.trim() ? 'var(--text-invert)' : 'var(--text-tertiary)'} />
                </button>
              </div>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '10px',
                color: 'var(--text-tertiary)', marginTop: '8px', letterSpacing: '0.08em',
              }}>
                ENCRYPTED SESSION · CONTEXT-AWARE · TACTICALLY CALIBRATED
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #architect-chat .chat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
