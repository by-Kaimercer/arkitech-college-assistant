import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const AID_SYSTEM = `You are the ARCHITECT Financial Aid Estimator. Given household data and a school, estimate financial aid.

Return ONLY valid JSON:
{
  "estimates": [
    {
      "school": "Harvard University",
      "total_cost": 82000,
      "estimated_aid": 68000,
      "net_cost": 14000,
      "grants": 65000,
      "loans": 3000,
      "work_study": 800,
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}`

const SCHOLARSHIP_SYSTEM = `You are the ARCHITECT Scholarship Finder. Given a student profile, suggest matching scholarships.

Return ONLY valid JSON:
{
  "scholarships": [
    {
      "name": "Scholarship Name",
      "amount": "$10,000",
      "deadline": "March 2026",
      "eligibility": "Brief eligibility",
      "url": "https://example.com"
    }
  ]
}`

const FAFSA_STEPS = [
  { label: 'Create FSA ID (student + one parent)', detail: 'Both student and one parent need a Federal Student Aid ID. Create at studentaid.gov. This takes about 10 minutes but may take 1-3 days to process.' },
  { label: 'Gather tax documents (prior-prior year)', detail: 'You\'ll need federal tax returns, W-2s, and records of untaxed income from TWO years before the academic year. For 2026-27, use 2024 tax data.' },
  { label: 'List all target schools on FAFSA form', detail: 'You can list up to 20 schools. Each school receives your FAFSA data to calculate your aid package. Order does not matter for federal aid.' },
  { label: 'Submit FAFSA as early as possible (Oct 1)', detail: 'Many state and institutional aid programs are first-come, first-served. Filing early maximizes your aid potential. Aim for October 1 submission.' },
  { label: 'Review Student Aid Report (SAR)', detail: 'After filing, you\'ll receive a SAR within 3-5 days. Review it for errors — a single mistake can cost thousands in lost aid.' },
  { label: 'Compare aid packages after acceptance', detail: 'Don\'t just compare the total aid number. Compare NET COST (total cost minus grants). Loans are NOT free money — weigh them carefully.' },
  { label: 'Appeal aid package if circumstances changed', detail: 'If your financial situation has changed since filing, contact financial aid offices directly. Many schools adjust packages for documented changes.' },
]

export default function FinancialIntel() {
  const { financialData, updateFinancialData, collegeList, studentProfile } = useAppStore()
  const { callAPI: estimateAid, isLoading: estimating } = useClaudeAPI({ systemPrompt: AID_SYSTEM, maxTokens: 2000 })
  const { callAPI: findScholarships, isLoading: findingScholarships } = useClaudeAPI({ systemPrompt: SCHOLARSHIP_SYSTEM, maxTokens: 1500 })
  const [aidResults, setAidResults] = useState(null)
  const [scholarships, setScholarships] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  const runEstimate = async () => {
    const schools = collegeList.length > 0 ? collegeList.map((c) => c.name).join(', ') : 'Harvard, MIT, Stanford'
    const prompt = `Household Income: $${financialData.householdIncome.toLocaleString()}
Family Size: ${financialData.familySize}
Assets: ${[financialData.hasHomeEquity && 'Home equity', financialData.hasSavings && 'Savings', financialData.hasInvestments && 'Investments'].filter(Boolean).join(', ') || 'None reported'}
Parent Status: ${financialData.parentMaritalStatus}
Student Savings: $${financialData.studentSavings || 0}
Siblings in College: ${financialData.siblingsInCollege}

Schools: ${schools}

Estimate financial aid for each school.`

    const data = await estimateAid(prompt, { stream: false, jsonMode: true })
    if (data?.estimates) setAidResults(data.estimates)
  }

  const runScholarshipSearch = async () => {
    const prompt = `Student: ${studentProfile.name || 'Student'}
GPA: ${studentProfile.gpa || 'N/A'}
Major: ${studentProfile.targetCourse || studentProfile.intendedMajor || 'Undeclared'}
Spikes: ${studentProfile.spikeCategories?.join(', ') || 'N/A'}
First Gen: ${studentProfile.firstGen ? 'Yes' : 'No'}
Income Level: $${financialData.householdIncome.toLocaleString()}

Find matching scholarships.`

    const data = await findScholarships(prompt, { stream: false, jsonMode: true })
    if (data?.scholarships) setScholarships(data.scholarships)
  }

  const toggleFAFSAStep = (idx) => {
    setCompletedSteps((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx])
  }

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ FINANCIAL INTELLIGENCE — AID MAXIMIZATION ]</span>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          DECODE YOUR AID PACKAGE
        </h1>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Aid Estimator */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '24px' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ AID ESTIMATOR ]</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>HOUSEHOLD INCOME</p>
              <input className="input-dark" type="range" min="0" max="250000" step="5000" value={financialData.householdIncome}
                onChange={(e) => updateFinancialData({ householdIncome: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-acid)' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--accent-acid)' }}>
                ${financialData.householdIncome.toLocaleString()} / yr
              </span>
            </div>

            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>FAMILY SIZE</p>
              <input className="input-dark" type="number" min="1" max="12" value={financialData.familySize} onChange={(e) => updateFinancialData({ familySize: parseInt(e.target.value) })} />
            </div>

            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>ASSETS</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  ['hasHomeEquity', 'HOME EQUITY'],
                  ['hasSavings', 'SAVINGS'],
                  ['hasInvestments', 'INVESTMENTS'],
                ].map(([key, label]) => (
                  <div key={key} className={`checkbox-chip ${financialData[key] ? 'selected' : ''}`}
                    onClick={() => updateFinancialData({ [key]: !financialData[key] })}>
                    {financialData[key] ? '✓ ' : ''}{label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>PARENT MARITAL STATUS</p>
              <select className="input-dark" value={financialData.parentMaritalStatus} onChange={(e) => updateFinancialData({ parentMaritalStatus: e.target.value })}>
                {['Married', 'Divorced', 'Single', 'Widowed'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <p className="label-tag" style={{ marginBottom: '4px' }}>SIBLINGS IN COLLEGE SIMULTANEOUSLY</p>
              <input className="input-dark" type="number" min="0" max="8" value={financialData.siblingsInCollege} onChange={(e) => updateFinancialData({ siblingsInCollege: parseInt(e.target.value) })} />
            </div>
          </div>

          <button className="btn-primary" onClick={runEstimate} disabled={estimating}
            style={{ width: '100%', justifyContent: 'center', marginTop: '20px', fontSize: '12px', padding: '12px' }}>
            {estimating ? '[ ARCHITECT PROCESSING... ]' : '→ CALCULATE AID ESTIMATES'}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          {aidResults ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aidResults.map((est, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>{est.school}</p>

                  <div style={{ borderTop: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)', padding: '8px 0', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>Total Cost of Attendance:</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)' }}>${est.total_cost?.toLocaleString()} / yr</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>Estimated Financial Aid:</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-acid)' }}>-${est.estimated_aid?.toLocaleString()} / yr</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>ESTIMATED NET COST:</span>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '20px', color: 'var(--accent-acid)' }}>${est.net_cost?.toLocaleString()} / yr</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    {[
                      { label: 'Grants', value: est.grants, color: 'var(--accent-acid)' },
                      { label: 'Loans', value: est.loans, color: 'var(--accent-amber)' },
                      { label: 'Work-Study', value: est.work_study, color: 'var(--text-secondary)' },
                    ].map((item) => (
                      <div key={item.label} style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--text-tertiary)', letterSpacing: '0.08em', marginBottom: '2px' }}>{item.label}</p>
                        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: item.color }}>${item.value?.toLocaleString()}</p>
                        <div style={{ height: '3px', background: 'var(--bg-border)', marginTop: '4px' }}>
                          <div style={{ height: '100%', width: `${Math.min((item.value / est.total_cost) * 100, 100)}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {est.tips?.map((tip, j) => (
                    <p key={j} style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>● {tip}</p>
                  ))}
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed var(--bg-border)', borderRadius: '4px', minHeight: '300px',
            }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                [ AWAITING INPUT — ENTER FINANCIAL DATA AND CALCULATE ]
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAFSA Checklist */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px', marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ FAFSA DEPLOYMENT CHECKLIST ]</span>
        {FAFSA_STEPS.map((step, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--bg-border)', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'none' }} onClick={() => setExpandedStep(expandedStep === i ? null : i)}>
              <button onClick={(e) => { e.stopPropagation(); toggleFAFSAStep(i) }} style={{
                width: '20px', height: '20px', flexShrink: 0,
                border: `1px solid ${completedSteps.includes(i) ? 'var(--accent-acid)' : 'var(--bg-border)'}`,
                background: completedSteps.includes(i) ? 'var(--accent-acid)' : 'transparent',
                borderRadius: '2px', cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-invert)', fontSize: '12px',
              }}>
                {completedSteps.includes(i) ? '✓' : ''}
              </button>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: '13px',
                color: completedSteps.includes(i) ? 'var(--text-tertiary)' : 'var(--text-primary)',
                textDecoration: completedSteps.includes(i) ? 'line-through' : 'none',
                flex: 1,
              }}>{step.label}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                {expandedStep === i ? '▾' : '▸'}
              </span>
            </div>
            {expandedStep === i && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '8px', paddingLeft: '32px' }}>
                {step.detail}
              </motion.p>
            )}
          </div>
        ))}
      </div>

      {/* Scholarship Radar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '16px' }}>[ EXTERNAL SCHOLARSHIP INTELLIGENCE ]</span>
        <button className="btn-ghost" onClick={runScholarshipSearch} disabled={findingScholarships}
          style={{ marginBottom: '16px', fontSize: '11px' }}>
          {findingScholarships ? '[ ARCHITECT PROCESSING... ]' : '→ FIND SCHOLARSHIPS MATCHING MY PROFILE'}
        </button>

        {scholarships && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scholarships.map((sch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{sch.name}</p>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)' }}>{sch.eligibility}</p>
                </div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--accent-acid)' }}>{sch.amount}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-tertiary)' }}>{sch.deadline}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
