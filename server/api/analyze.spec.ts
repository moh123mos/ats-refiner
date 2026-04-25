import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { createSession } from '../services/storage/session'

// We use e2e setup for API testing in Nuxt
await setup({
  server: true,
  browser: false
})

describe('Analyze API Endpoint', () => {
  const sessionId = 'test-session-123'

  beforeEach(() => {
    // Manually seed the session since we are testing the real handler
    createSession(sessionId, 'resume.pdf', 'pdf')
    // We need to update it with some text because analyze.post.ts checks for it
    const { updateSession } = require('../services/storage/session')
    updateSession(sessionId, { normalizedText: 'This is a test resume content for analysis.' })
  })

  it('should return error if sessionId is missing', async () => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ jobDescription: 'Looking for a dev.' })
    })
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.errorCode).toBe('MISSING_SESSION_ID')
  })

  it('should return error if jobDescription is too short', async () => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jobDescription: 'Short' })
    })
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.errorCode).toBe('INVALID_JD')
  })

  it('should return success with valid input', async () => {
    // Note: This will actually call the mock analysis because GEMINI_API_KEY is not set
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        jobDescription: 'This is a long enough job description for a software engineer role.'
      })
    })
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.atsScore).toBeDefined()
  })
})
