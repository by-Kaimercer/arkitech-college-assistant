import { useState, useCallback, useRef } from 'react'

const API_URL = 'https://api.anthropic.com/v1/messages'

export function useClaudeAPI({ systemPrompt, model = 'claude-sonnet-4-20250514', maxTokens = 1500 }) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const callAPI = useCallback(async (userMessage, { stream = true, jsonMode = false } = {}) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
      setError('API key not configured. Set VITE_ANTHROPIC_API_KEY in .env')
      return null
    }

    setIsLoading(true)
    setError(null)
    setResult('')

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const systemText = jsonMode
        ? `${systemPrompt}\n\nIMPORTANT: Return your response as valid JSON only. No markdown, no code fences, no explanation outside the JSON.`
        : systemPrompt

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemText,
          messages: Array.isArray(userMessage) ? userMessage : [{ role: 'user', content: userMessage }],
          stream,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${response.status}`)
      }

      if (!stream) {
        const data = await response.json()
        const content = data.content?.[0]?.text || ''
        setResult(content)
        setIsLoading(false)
        if (jsonMode) {
          try {
            return JSON.parse(content)
          } catch {
            return content
          }
        }
        return content
      }

      // Streaming
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.trim())
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullContent += parsed.delta.text
                setResult(fullContent)
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      setIsLoading(false)
      if (jsonMode) {
        try {
          return JSON.parse(fullContent)
        } catch {
          return fullContent
        }
      }
      return fullContent
    } catch (err) {
      if (err.name === 'AbortError') return null
      setError(err.message)
      setIsLoading(false)
      return null
    }
  }, [systemPrompt, model, maxTokens])

  const abort = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
  }, [])

  return { callAPI, isLoading, result, error, abort, setResult }
}
