import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { BarChart2 } from 'lucide-react'

const FRAMEWORKS = [
  {
    title: 'THE OBSESSION PIVOT',
    body: 'Lead with a non-academic intellectual obsession. Frame your entire application around a single domain you have gone unreasonably deep on.',
  },
  {
    title: 'THE DELIBERATE TRADE-OFF',
    body: 'Frame the GPA as a conscious sacrifice for depth. Position average grades as the inevitable cost of pursuing something more meaningful than curriculum compliance.',
  },
  {
    title: 'THE CONTRARIAN EVIDENCE',
    body: "Open with a claim, then disprove the committee's assumption about you. Make them work to undo their initial read — then land the twist.",
  },
]

const ESSAY_SYSTEM = `You are the ARCHITECT Essay Analyst. Analyze the provided personal statement with clinical precision.

Return your analysis in exactly this format:

NARRATIVE STRENGTH: [score/10]
────────────────────────────────────────

DETECTED WEAKNESSES:
● [weakness 1]
● [weakness 2]
● [weakness 3]

────────────────────────────────────────
STRATEGIC RECOMMENDATIONS:
1. [specific tactical improvement]
2. [specific tactical improvement]
3. [specific tactical improvement]

────────────────────────────────────────
REFRAME OPPORTUNITIES:
● CHANGE: "[original weak phrase]" → "[stronger reframe]"
● CHANGE: "[original weak phrase]" → "[stronger reframe]"
● CHANGE: "[original weak phrase]" → "[stronger reframe]"

────────────────────────────────────────
GENERATE: A rewritten opening paragraph that demonstrates narrative dominance.

Be clinical, specific, and tactical. No generic praise. No soft feedback.`

export default function EssayWorkshop() {
  const [essay, setEssay] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lineCount, setLineCount] = useState(1)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    const lines = essay.split('\n').length
    setLineCount(Math.max(lines, 1))
  }, [essay])

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  const runAnalysis = async () => {
    if (!essay.trim()) return
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
      setAnalysis('[ SYSTEM ERROR — API KEY NOT CONFIGURED ]\n\nAdd your Anthropic API key to .env to enable essay analysis.')
      return
    }

    setIsAnalyzing(true)
    setAnalysis('')

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: ESSAY_SYSTEM,
          messages: [{ role: 'user', content: `Analyze this personal statement:\n\n${essay}` }],
          stream: true,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.delta?.text) {
              full += parsed.delta.text
              setAnalysis(full)
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      setAnalysis(`[ SYSTEM ERROR — RETRY PROTOCOL ]\n\n${err.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const strengthMatch = analysis.match(/NARRATIVE STRENGTH:\s*\[?(\d+\.?\d*)\/10\]?/)
  const strengthScore = strengthMatch ? parseFloat(strengthMatch[1]) : null

  return (
    <section id="essay-workshop" ref={ref} style={{ padding: '120px 24px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} style={{ marginBottom: '48px' }}>
          <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ NARRATIVE ENGINE ]</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
            ESSAY WORKSHOP
          </h2>
        </motion.div>

        {/* Two panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '48px' }}>
          {/* Left: Editor */}
          <div style={{ background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ NARRATIVE INPUT ]</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-tertiary)' }}>{wordCount}w</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-tertiary)' }}>~{readingTime}min</span>
              </div>
            </div>
            <div className="essay-editor-wrap" style={{ flex: 1 }}>
              <div className="line-numbers">
                {Array.from({ length: Math.max(lineCount, 12) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                className="essay-textarea"
                value={essay}
                onChange={e => setEssay(e.target.value)}
                placeholder="Paste or type your personal statement here..."
                style={{ minHeight: '360px' }}
              />
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={runAnalysis} disabled={isAnalyzing || !essay.trim()} style={{ fontSize: '12px', padding: '10px 20px', opacity: essay.trim() ? 1 : 0.5 }}>
                <BarChart2 size={13} />
                {isAnalyzing ? 'ANALYZING...' : 'RUN ARCHITECT ANALYSIS'}
              </button>
              <button className="btn-dark" style={{ fontSize: '10px' }} onClick={() => { setEssay(''); setAnalysis('') }}>CLEAR</button>
            </div>
          </div>

          {/* Right: Analysis */}
          <div style={{ background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ ARCHITECT ASSESSMENT ]</span>
            </div>
            {strengthScore !== null && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
                <p className="label-tag" style={{ marginBottom: '8px' }}>NARRATIVE STRENGTH</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '4px', background: 'var(--bg-border)', borderRadius: '0' }}>
                    <div style={{ height: '100%', width: `${(strengthScore / 10) * 100}%`, background: strengthScore >= 7 ? 'var(--accent-acid)' : strengthScore >= 5 ? 'var(--accent-amber)' : 'var(--accent-red)', transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--accent-acid)', whiteSpace: 'nowrap' }}>
                    [ {strengthScore} / 10 ]
                  </span>
                </div>
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {!analysis && !isAnalyzing && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
                  [ NO INTEL AVAILABLE — BEGIN AUDIT ]<br /><br />
                  Paste your essay and run the analysis to receive tactical feedback from the Architect.
                </p>
              )}
              {isAnalyzing && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-acid)', letterSpacing: '0.05em' }}>
                  [ ARCHITECT PROCESSING... ]
                </p>
              )}
              {analysis && (
                <pre style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {analysis}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Narrative Frameworks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          <p className="label-tag" style={{ color: 'var(--accent-acid)', marginBottom: '24px' }}>[ NARRATIVE FRAMEWORKS ]</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'var(--bg-border)', border: '1px solid var(--bg-border)', borderRadius: '4px', overflow: 'hidden' }}>
            {FRAMEWORKS.map((f, i) => (
              <div key={i} className="card" style={{ borderRadius: 0, border: 'none' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '64px', color: 'rgba(200,241,53,0.06)', lineHeight: 1, marginBottom: '-12px' }}>0{i + 1}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--accent-acid)', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #essay-workshop .essay-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
