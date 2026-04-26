import { getSession } from '../../services/storage/session'
import type { DownloadResponse } from '../../app/types'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')

  if (!sessionId) {
    return {
      success: false,
      message: 'Session ID is required',
      data: null,
      errorCode: 'MISSING_SESSION_ID'
    } as DownloadResponse
  }

  const session = getSession(sessionId)
  if (!session) {
    return {
      success: false,
      message: 'Session not found or expired',
      data: null,
      errorCode: 'SESSION_NOT_FOUND'
    } as DownloadResponse
  }

  if (!session.analysis?.improvedResumeText) {
    return {
      success: false,
      message: 'No analysis available. Please run analysis first.',
      data: null,
      errorCode: 'NO_ANALYSIS'
    } as DownloadResponse
  }

  const baseName = session.fileName.replace(/\.(pdf|docx)$/i, '')
  const fileName = `${baseName}_improved.txt`

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`)

  return {
    success: true,
    message: 'Download ready',
    data: {
      fileName,
      content: session.analysis.improvedResumeText,
      mimeType: 'text/plain'
    }
  } as DownloadResponse
})
