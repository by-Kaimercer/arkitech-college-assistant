import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const TIERS = [
  {
    name: 'RECONNAISSANCE',
    price: 'FREE',
    priceSecondary: null,
    featured: false,
    popular: true,
    features: [
      '5 Architect conversations/month',
      'University Intel (3 targets)',
      'Basic essay analysis',
      'Profile builder access',
      'Phase 01 audits only',
    ],
    cta: 'DEPLOY FREE →',
  },
  {
    name: 'INFILTRATION',
    price: '$19',
    priceSecondary: '₹999 / month',
    featured: true,
    popular: false,
    features: [
      'Unlimited Architect conversations',
      'Full university database (180+ targets)',
      'Advanced essay optimizer + CV workshop',
      'Interview prep module',
      'All 3 phases unlocked',
      'Priority support',
    ],
    cta: 'DEPLOY INFILTRATION →',
  },
  {
    name: 'FULL SPECTRUM',
    price: '$49',
    priceSecondary: 'per month',
    featured: false,
    popular: false,
    features: [
      'Everything in Infiltration',
      'Human strategy review by consultant',
      '1:1 consultation session',
      'Guaranteed 24hr response',
      'Application review & editing',
      'Interview simulation',
    ],
    cta: 'DEPLOY FULL SPECTRUM →',
  },
]

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="pricing" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} style={{ marginBottom: '64px', textAlign: 'center' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ ACCESS TIERS ]</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
            CHOOSE YOUR DEPLOYMENT LEVEL
          </h2>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            No CV required. No perfect GPA needed. Just a target.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              className={`pricing-card ${tier.featured ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute', top: '-1px', right: '20px',
                  background: 'var(--accent-acid)', color: 'var(--text-invert)',
                  fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.1em',
                  padding: '4px 10px',
                }}>
                  MOST POPULAR
                </div>
              )}
              {tier.featured && (
                <div style={{
                  position: 'absolute', top: '-1px', right: '20px',
                  background: 'var(--accent-acid)', color: 'var(--text-invert)',
                  fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.1em',
                  padding: '4px 10px',
                }}>
                  RECOMMENDED
                </div>
              )}

              <span className="label-tag" style={{ display: 'block', marginBottom: '12px' }}>TIER — {tier.name}</span>
              <div className="price-tag">{tier.price}</div>
              {tier.priceSecondary && (
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '0.05em' }}>
                  {tier.priceSecondary}
                </p>
              )}

              <div style={{ height: '1px', background: 'var(--bg-border)', margin: '24px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent-acid)', marginTop: '1px', flexShrink: 0 }}>●</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                className={tier.featured ? 'btn-primary' : 'btn-ghost'}
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: '48px' }}
        >
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.8 }}>
            All plans include access to the ARCHITECT AI. Cancel anytime.<br />
            <span style={{ color: 'var(--accent-acid)' }}>The system can be decoded. Let&apos;s decode it.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
