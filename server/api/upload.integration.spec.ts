import { describe, it, expect, vi } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'
import { getSession } from '../services/storage/session'

// This sets up the Nuxt integration environment
await setup({
  server: true,
})

describe('Upload Integration (API -> Parser -> Storage)', () => {
  it('should process an uploaded file and create a session', async () => {
    // 1. Create a dummy file buffer (simulating a PDF)
    const formData = new FormData()
    const blob = new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' })
    formData.append('file', blob, 'test-resume.pdf')

    // 2. Call the real API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    // 3. Verify the API response
    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.data.sessionId).toBeDefined()

    // 4. INTEGRATION CHECK: Verify the data reached the Storage Service
    const session = getSession(result.data.sessionId)
    expect(session).not.toBeNull()
    expect(session?.fileName).toBe('test-resume.pdf')
    expect(session?.status).toBe('parsing') 
  })
})
