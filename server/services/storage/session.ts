import type { SessionState } from '../../app/types'

const sessions = new Map<string, SessionState>()

const SESSION_TTL_MS = 30 * 60 * 1000

export function generateSessionId(): string {
  return crypto.randomUUID()
}

export function createSession(sessionId: string, fileName: string, fileType: 'pdf' | 'docx'): SessionState {
  const now = new Date().toISOString()
  const session: SessionState = {
    sessionId,
    status: 'parsing',
    fileName,
    fileType,
    rawText: '',
    normalizedText: '',
    jobDescription: '',
    analysis: null,
    createdAt: now,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
  }
  sessions.set(sessionId, session)
  return session
}

export function getSession(sessionId: string): SessionState | null {
  const session = sessions.get(sessionId)
  if (!session) return null

  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(sessionId)
    return null
  }
  return session
}

export function updateSession(sessionId: string, updates: Partial<SessionState>): SessionState | null {
  const session = sessions.get(sessionId)
  if (!session) return null

  const updated = { ...session, ...updates }
  sessions.set(sessionId, updated)
  return updated
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId)
}

export function cleanupExpiredSessions(): number {
  const now = new Date()
  let cleaned = 0

  for (const [id, session] of sessions) {
    if (new Date(session.expiresAt) < now) {
      sessions.delete(id)
      cleaned++
    }
  }

  return cleaned
}
