import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('INITIALIZING CORE SYSTEMS...')

  const statusMessages = [
    'INITIALIZING CORE SYSTEMS...',
    'LOADING INSTITUTIONAL DATABASE...',
    'CALIBRATING STRATEGY ENGINE...',
    'DEPLOYING ARCHITECT AI...',
    'SYSTEMS ONLINE — READY TO DEPLOY',
  ]

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += 2
      setProgress(current)
      const idx = Math.floor((current / 100) * (statusMessages.length - 1))
      setStatusText(statusMessages[Math.min(idx, statusMessages.length - 1)])
      if (current >= 100) {
        clearInterval(interval)
        setTimeout(onComplete, 400)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="loading-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            fontSize: '32px',
            letterSpacing: '0.08em',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: 'var(--accent-acid)' }}>[</span>
          <span style={{ color: 'var(--text-primary)', margin: '0 10px' }}>ARCHITECT</span>
          <span style={{ color: 'var(--accent-acid)' }}>]</span>
        </motion.div>

        {/* Status text */}
        <motion.p
          key={statusText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}
        >
          {statusText}
        </motion.p>

        {/* Progress bar */}
        <div className="loading-progress">
          <div
            className="loading-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress number */}
        <p style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '10px',
          color: 'var(--accent-acid)',
          marginTop: '12px',
          letterSpacing: '0.1em',
        }}>
          {progress.toString().padStart(3, '0')}%
        </p>
      </div>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '32px',
          fontFamily: 'Space Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.1em',
        }}
      >
        THE SYSTEM CAN BE DECODED. LET&apos;S DECODE IT.
      </motion.p>
    </motion.div>
  )
}
