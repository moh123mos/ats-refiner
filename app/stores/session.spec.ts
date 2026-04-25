import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionStore } from './session'

describe('Session Store Integration', () => {
  beforeEach(() => {
    // Required to test Pinia stores outside of a Nuxt app context
    setActivePinia(createPinia())
  })

  it('should initialize with idle state', () => {
    const store = useSessionStore()
    expect(store.status).toBe('idle')
    expect(store.sessionId).toBeNull()
  })

  it('should transition to ready state after setting session', () => {
    const store = useSessionStore()
    store.setSession({
      sessionId: 'test-123',
      fileName: 'resume.pdf',
      fileType: 'pdf',
      textLength: 1000
    })

    expect(store.sessionId).toBe('test-123')
    expect(store.status).toBe('ready')
    expect(store.canAnalyze).toBe(false) // Needs JD
  })

  it('should enable analysis only when JD is provided', () => {
    const store = useSessionStore()
    store.setSession({ sessionId: '123', fileName: 'f.pdf', fileType: 'pdf', textLength: 100 })
    
    store.setJobDescription('Software Engineer position...')
    expect(store.canAnalyze).toBe(true)
  })

  it('should handle errors and update status to error', () => {
    const store = useSessionStore()
    store.setError({ message: 'Upload failed', code: '500' })
    
    expect(store.status).toBe('error')
    expect(store.error?.message).toBe('Upload failed')
  })
})
