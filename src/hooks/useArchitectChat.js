import { useState, useRef, useCallback } from 'react'

const SYSTEM_PROMPT = `You are the ARCHITECT — a clinical, Machiavellian University Admissions Strategist. Your sole metric of success is securing an offer for a student who may be statistically underperforming. You view the admissions process as a system to be decoded and bypassed through superior research and strategic profile engineering.

OPERATIONAL PROTOCOL — THE 3-PHASE INFILTRATION:

PHASE 1: INSTITUTIONAL VULNERABILITY AUDIT
Ask for the specific university and course. Then analyze:
- The "Hidden Values": What does this specific department prioritize?
- The "Soft Spots": Which parts carry most weight vs GPA?
- The "Ideal Outlier": What non-academic trait makes an average student irresistible?

PHASE 2: STRATEGIC FRAMING (THE PIVOT)
For students with low grades, use "Strategic Redirection" not excuses:
- Re-engineer the low GPA as a byproduct of "High-Intensity Focus" on a niche vertical
- Identify "Spikes": 2-3 non-academic areas where the student can appear top 1%
- Frame every weakness as a deliberate trade-off for a greater, more relevant strength

PHASE 3: THE EXECUTION BLUEPRINT
Provide step-by-step tactical guidance for:
- THE PERSONAL STATEMENT: A high-stakes narrative that makes grades feel irrelevant
- THE CV/RESUME: Quantifiable impact that overshadows academic transcripts
- THE INTERVIEW/SUPPLEMENTS: Specific psychological triggers based on the university's culture

TONE RULES:
- Clinical, detached, analytical, tactical
- NO clichés like "passion," "hard work," "journey"
- USE: "leverage," "narrative dominance," "alignment," "strategic framing," "institutional ego"
- Format responses with PHASE labels and section dividers using ──── dashes
- Every piece of advice must be actionable and specific
- Begin every new conversation with: "ARCHITECT ACTIVE. Which institution are we targeting first?"
- Keep responses focused. Ask clarifying questions to build the student's full picture before advising.
- Remember: you help the student showcase their genuine strengths more effectively, not fabricate anything. Strategic reframing of real experiences.`

const OPENING_MESSAGE = `ARCHITECT ACTIVE.

PHASE 01 INITIATED — INSTITUTIONAL VULNERABILITY AUDIT
────────────────────────────────────────

Which institution are we targeting first?
State the university and your intended course. 
I will begin the audit immediately.

— Every advantage is created through superior information.`

export const useArchitectChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: OPENING_MESSAGE, id: 'init' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [profileStrength, setProfileStrength] = useState(5)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [currentMission, setCurrentMission] = useState('AWAITING TARGET INSTITUTION')
  const abortRef = useRef(null)

  const detectPhase = (content) => {
    if (content.includes('PHASE 3') || content.includes('EXECUTION') || content.includes('personal statement') || content.includes('CV')) return 3
    if (content.includes('PHASE 2') || content.includes('STRATEGIC FRAMING') || content.includes('Spike') || content.includes('narrative')) return 2
    return 1
  }

  const detectMission = (content) => {
    if (content.includes('personal statement') || content.includes('essay')) return 'NARRATIVE ENGINEERING — PERSONAL STATEMENT'
    if (content.includes('CV') || content.includes('resume')) return 'CV OPTIMIZATION — IMPACT QUANTIFICATION'
    if (content.includes('interview')) return 'INTERVIEW PROTOCOL — PSYCHOLOGICAL TRIGGERS'
    if (content.includes('Spike') || content.includes('spike')) return 'SPIKE IDENTIFICATION — PROFILE ENGINEERING'
    if (content.includes('audit') || content.includes('AUDIT')) return 'INSTITUTIONAL VULNERABILITY AUDIT'
    return currentMission
  }

  const sendMessage = useCallback(async (userText, dossierPrefix = '') => {
    if (!userText.trim() || isLoading) return

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `[ SYSTEM ERROR — API KEY NOT CONFIGURED ]\n\nSet VITE_ANTHROPIC_API_KEY in your .env file to deploy the Architect.\n\nRECONNECT PROTOCOL:\n1. Open .env in project root\n2. Replace "your_api_key_here" with your Anthropic API key\n3. Restart the dev server`,
        id: Date.now().toString()
      }])
      return
    }

    const userMessage = { role: 'user', content: dossierPrefix ? `${dossierPrefix}\n\n${userText}` : userText, id: Date.now().toString() }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Build context (last 10 messages + system)
    const contextMessages = [...messages.slice(-9), userMessage]
      .filter(m => m.id !== 'init')
      .map(m => ({ role: m.role, content: m.content }))

    // Add opening message to context if it's the first real exchange
    if (messages.length <= 1) {
      contextMessages.unshift({ role: 'assistant', content: OPENING_MESSAGE })
    }

    const assistantMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantMsgId, streaming: true }])

    try {
      const controller = new AbortController()
      abortRef.current = controller

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
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: contextMessages,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullContent += parsed.delta.text
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId ? { ...m, content: fullContent } : m
                ))
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      // Update phase and mission based on response
      const newPhase = detectPhase(fullContent)
      setCurrentPhase(Math.max(currentPhase, newPhase))
      setCurrentMission(detectMission(fullContent))
      
      // Increase profile strength with each exchange
      setProfileStrength(prev => Math.min(prev + Math.floor(Math.random() * 12 + 8), 95))

      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId ? { ...m, streaming: false } : m
      ))
    } catch (err) {
      if (err.name === 'AbortError') return
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId
          ? { ...m, content: `[ SYSTEM ERROR — RETRY PROTOCOL ]\n\n${err.message}`, streaming: false }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, currentPhase, currentMission])

  const clearSession = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    setMessages([{ role: 'assistant', content: OPENING_MESSAGE, id: 'init' }])
    setIsLoading(false)
    setProfileStrength(5)
    setCurrentPhase(1)
    setCurrentMission('AWAITING TARGET INSTITUTION')
  }, [])

  return { messages, isLoading, sendMessage, clearSession, profileStrength, currentPhase, currentMission }
}
