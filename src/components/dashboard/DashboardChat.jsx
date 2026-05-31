import { useState } from 'react'
import { useArchitectChat } from '../../hooks/useArchitectChat'
import { useAppStore } from '../../store/useAppStore'
import { Send, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

function MessageContent({ content, streaming }) {
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {content}
      {streaming ? <span style={{ color: 'var(--accent-acid)', animation: 'pulse-anim 1s infinite' }}>▋</span> : null}
    </span>
  )
}

export default function DashboardChat() {
  const {
    messages, isLoading, sendMessage, clearSession,
    profileStrength, currentPhase, currentMission
  } = useArchitectChat()
  const { studentProfile } = useAppStore()

  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', borderBottom: '1px solid var(--bg-border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="pulse-dot" />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>ARCHITECT AI</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
            PHASE {String(currentPhase).padStart(2, '0')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent-acid)' }}>▶ {currentMission}</span>
          <button className="btn-dark" style={{ fontSize: '10px', padding: '6px 12px' }} onClick={clearSession}>
            <X size={12} /> CLEAR
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: '20px',
        background: 'var(--bg-void)',
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' ? (
              <div style={{ maxWidth: '100%' }}>
                <div className="chat-ai-label">[ ARCHITECT ]</div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                  <MessageContent content={msg.content} streaming={msg.streaming} />
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
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--accent-acid)' }}>[ ARCHITECT PROCESSING... ]</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--bg-border)', padding: '16px 24px',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={handleKeyDown}
            placeholder="State your directive..."
            rows={1}
            className="input-dark"
            style={{ resize: 'none', lineHeight: '1.6', maxHeight: '120px', flex: 1 }}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: input.trim() ? 'var(--accent-acid)' : 'var(--bg-border)',
            border: 'none', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'none' : 'default',
            transition: 'all 0.2s ease',
          }}>
            <Send size={16} color={input.trim() ? 'var(--text-invert)' : 'var(--text-tertiary)'} />
          </button>
        </div>
      </div>
    </div>
  )
}
