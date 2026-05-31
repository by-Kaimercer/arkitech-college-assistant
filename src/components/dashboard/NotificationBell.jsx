import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

function timeAgo(dateString) {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const ICON_MAP = {
  mission: '◆',
  alert: '⚠',
  intel: '◎',
  system: '▶',
  achievement: '★',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const { notifications, markNotificationRead, clearNotifications } = useAppStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid var(--bg-border)',
          borderRadius: '4px',
          color: 'var(--text-secondary)',
          cursor: 'none',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        <Bell size={14} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'var(--accent-acid)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '8px',
              fontWeight: 700,
              color: 'var(--text-invert)',
              lineHeight: 1,
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '320px',
              maxHeight: '420px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: '4px',
              overflow: 'hidden',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Panel header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid var(--bg-border)',
            }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', fontSize: '9px' }}>
                [ INTEL FEED — {notifications.length} ]
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearNotifications()}
                    style={{
                      background: 'none',
                      border: '1px solid var(--bg-border)',
                      borderRadius: '2px',
                      color: 'var(--text-tertiary)',
                      cursor: 'none',
                      padding: '2px 6px',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '8px',
                      letterSpacing: '0.1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-red)'
                      e.currentTarget.style.color = 'var(--accent-red)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--bg-border)'
                      e.currentTarget.style.color = 'var(--text-tertiary)'
                    }}
                  >
                    CLEAR ALL
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'none',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '40px 16px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                  }}>
                    [ NO ACTIVE INTEL ]
                  </p>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginTop: '4px',
                  }}>
                    Complete missions to receive updates
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markNotificationRead(notif.id)
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--bg-border)',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      background: notif.read ? 'transparent' : 'rgba(200, 241, 53, 0.02)',
                      cursor: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-elevated)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(200, 241, 53, 0.02)'
                    }}
                  >
                    {/* Type icon */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      border: `1px solid ${notif.read ? 'var(--bg-border)' : 'var(--accent-acid)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '10px',
                      color: notif.read ? 'var(--text-tertiary)' : 'var(--accent-acid)',
                    }}>
                      {ICON_MAP[notif.type] || '●'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '11px',
                        color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                        lineHeight: 1.5,
                        marginBottom: '2px',
                      }}>
                        {notif.message}
                      </p>
                      <span style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '8px',
                        color: 'var(--text-tertiary)',
                        letterSpacing: '0.1em',
                      }}>
                        {timeAgo(notif.time)}
                      </span>
                    </div>

                    {/* Read indicator */}
                    {!notif.read && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-acid)',
                        flexShrink: 0,
                        marginTop: '6px',
                      }} />
                    )}
                    {notif.read && (
                      <Check size={10} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
