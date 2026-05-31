import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'

const PREP_SYSTEM = `You are the ARCHITECT Interview Preparation system. Given a school and student profile, generate interview prep materials.

Return ONLY valid JSON:
{
  "format": "alumni / admissions officer / optional / none",
  "what_they_look_for": "Brief description",
  "question_themes": ["theme1", "theme2"],
  "questions": [
    {"question": "Question text", "category": "Category"},
    {"question": "Question text", "category": "Category"}
  ],
  "psychological_triggers": [
    "Trigger insight 1",
    "Trigger insight 2",
    "Trigger insight 3"
  ],
  "unusual_questions_to_ask": [
    "Question to ask the interviewer 1",
    "Question to ask the interviewer 2"
  ]
}`

const REVIEW_SYSTEM = `You are the ARCHITECT Interview Coach. Score a student's interview answer.

Return ONLY valid JSON:
{
  "scores": {
    "specificity": 7,
    "authenticity": 8,
    "strategic_alignment": 6,
    "conciseness": 7
  },
  "feedback": "Brief coaching feedback.",
  "what_to_add": "What to add",
  "what_to_remove": "What to remove",
  "reframe": "How to reframe"
}`

const MOCK_SYSTEM = `You are an admissions interviewer for {school}. Conduct a realistic alumni interview. Ask one question at a time. After the student responds, provide a brief [ ARCHITECT COACHING NOTE: ... ] in a separate line with specific tactical feedback. Then ask your next question. Be warm but probing. Start with an opening question.`

export default function InterviewPrep() {
  const { collegeList, studentProfile } = useAppStore()
  const { callAPI: prepAPI, isLoading: prepping } = useClaudeAPI({ systemPrompt: PREP_SYSTEM, maxTokens: 2000 })
  const [selectedSchool, setSelectedSchool] = useState('')
  const [prepData, setPrepData] = useState(null)
  const [practiceQuestion, setPracticeQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [reviewResult, setReviewResult] = useState(null)
  const [mockMessages, setMockMessages] = useState([])
  const [mockInput, setMockInput] = useState('')
  const [showMock, setShowMock] = useState(false)

  const { callAPI: reviewAPI, isLoading: reviewing } = useClaudeAPI({ systemPrompt: REVIEW_SYSTEM, maxTokens: 800 })

  const loadPrep = async () => {
    if (!selectedSchool) return
    const prompt = `School: ${selectedSchool}
Student Profile:
- Name: ${studentProfile.name || 'Student'}
- GPA: ${studentProfile.gpa || 'N/A'}
- Major: ${studentProfile.targetCourse || 'N/A'}
- Spikes: ${studentProfile.spikeCategories?.join(', ') || 'N/A'}

Generate interview prep materials for this school.`

    const data = await prepAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') setPrepData(data)
  }

  const reviewAnswer = async () => {
    if (!answer.trim() || !practiceQuestion) return
    const prompt = `School: ${selectedSchool}
Question: ${practiceQuestion.question}
Student Answer: ${answer}

Score and review this answer.`

    const data = await reviewAPI(prompt, { stream: false, jsonMode: true })
    if (data && typeof data === 'object') setReviewResult(data)
  }

  const startMockInterview = async () => {
    setShowMock(true)
    setMockMessages([])
    const mockSys = MOCK_SYSTEM.replace('{school}', selectedSchool)
    const { callAPI: mockCall } = useClaudeAPI({ systemPrompt: mockSys, maxTokens: 500 })

    // We'll handle mock in a simpler way using the existing API
    const response = await prepAPI(
      `Start a mock interview for ${selectedSchool}. Ask your first question as an alumni interviewer. Include a brief ARCHITECT COACHING NOTE.`,
      { stream: false }
    )
    if (response) {
      setMockMessages([{ role: 'interviewer', content: response }])
    }
  }

  const schools = collegeList.length > 0 ? collegeList : [{ id: '1', name: 'Harvard University' }, { id: '2', name: 'MIT' }, { id: '3', name: 'Stanford University' }]

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '24px' }}>
        <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ INTERROGATION PREPARATION ]</span>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          MASTER THE INTERVIEW
        </h1>
      </motion.div>

      {/* School Selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <select className="input-dark" value={selectedSchool} onChange={(e) => { setSelectedSchool(e.target.value); setPrepData(null); setReviewResult(null); setPracticeQuestion(null) }}
          style={{ maxWidth: '300px' }}>
          <option value="">— SELECT SCHOOL —</option>
          {schools.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <button className="btn-primary" onClick={loadPrep} disabled={prepping || !selectedSchool} style={{ fontSize: '12px', padding: '10px 20px' }}>
          {prepping ? '[ PROCESSING... ]' : '→ LOAD INTERVIEW INTEL'}
        </button>
      </div>

      {prepData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* School Intel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ INTERVIEW FORMAT ]</span>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                {prepData.format}
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '8px' }}>
                {prepData.what_they_look_for}
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '8px' }}>[ INSTITUTIONAL EGO ANALYSIS ]</span>
              {prepData.psychological_triggers?.map((trigger, i) => (
                <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--accent-acid)' }}>
                  {trigger}
                </p>
              ))}
            </div>
          </div>

          {/* Question Bank */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)' }}>[ QUESTION BANK ]</span>
            </div>
            {prepData.questions?.map((q, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 20px', borderBottom: '1px solid var(--bg-border)',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-tertiary)', width: '24px' }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>{q.question}</p>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>{q.category}</span>
                <button className="btn-dark" onClick={() => { setPracticeQuestion(q); setAnswer(''); setReviewResult(null) }} style={{ fontSize: '9px', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                  PRACTICE
                </button>
              </div>
            ))}
          </div>

          {/* Practice Mode */}
          {practiceQuestion && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '24px', marginBottom: '24px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ PRACTICE MODE ]</span>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.4 }}>
                "{practiceQuestion.question}"
              </p>
              <textarea className="input-dark" rows={5} placeholder="Type your answer here..."
                value={answer} onChange={(e) => setAnswer(e.target.value)}
                style={{ resize: 'vertical', lineHeight: 1.7, marginBottom: '12px' }} />
              <button className="btn-primary" onClick={reviewAnswer} disabled={reviewing || !answer.trim()} style={{ fontSize: '12px', padding: '10px 20px' }}>
                {reviewing ? '[ REVIEWING... ]' : '→ SUBMIT FOR ARCHITECT REVIEW'}
              </button>

              {reviewResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {reviewResult.scores && Object.entries(reviewResult.scores).map(([key, val]) => (
                      <div key={key} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '24px', color: val >= 7 ? 'var(--accent-acid)' : val >= 5 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{val}</p>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'var(--text-secondary)', letterSpacing: '0.08em', marginTop: '4px' }}>{key.toUpperCase()}</p>
                      </div>
                    ))}
                  </div>
                  {reviewResult.feedback && (
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '12px', borderLeft: '3px solid var(--accent-acid)', background: 'var(--bg-elevated)', borderRadius: '4px' }}>
                      {reviewResult.feedback}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Questions to Ask */}
          {prepData.unusual_questions_to_ask && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '20px' }}>
              <span className="label-tag" style={{ color: 'var(--accent-acid)', display: 'block', marginBottom: '12px' }}>[ QUESTIONS TO ASK YOUR INTERVIEWER ]</span>
              {prepData.unusual_questions_to_ask.map((q, i) => (
                <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '6px', paddingLeft: '12px', borderLeft: '2px solid var(--accent-acid)' }}>
                  "{q}"
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {!prepData && !prepping && (
        <div style={{
          padding: '80px 20px', textAlign: 'center',
          border: '1px dashed var(--bg-border)', borderRadius: '4px',
        }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            [ SELECT A SCHOOL TO LOAD INTERVIEW INTELLIGENCE ]
          </p>
        </div>
      )}
    </div>
  )
}
