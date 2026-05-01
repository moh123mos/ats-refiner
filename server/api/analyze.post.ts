import { getSession, updateSession } from '../services/storage/session'
import { analyzeWithAI } from '../services/ai/adapter'
import type { AnalyzeRequest, AnalyzeResponse } from '../../app/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { sessionId, jobDescription } = body as AnalyzeRequest

  if (!sessionId) {
    return {
      success: false,
      message: 'Session ID is required',
      data: null,
      errorCode: 'MISSING_SESSION_ID'
    } as AnalyzeResponse
  }

  if (!jobDescription || jobDescription.trim().length < 20) {
    return {
      success: false,
      message: 'Job description must be at least 20 characters',
      data: null,
      errorCode: 'INVALID_JD'
    } as AnalyzeResponse
  }

  if (jobDescription.trim().length > 20000) {
    return {
      success: false,
      message: 'Job description is too large (maximum 20,000 characters)',
      data: null,
      errorCode: 'PAYLOAD_TOO_LARGE'
    } as AnalyzeResponse
  }

  const session = getSession(sessionId)
  if (!session) {
    return {
      success: false,
      message: 'Session not found or expired',
      data: null,
      errorCode: 'SESSION_NOT_FOUND'
    } as AnalyzeResponse
  }

  if (!session.normalizedText || session.normalizedText.length < 50) {
    return {
      success: false,
      message: 'Resume text not found in session',
      data: null,
      errorCode: 'NO_RESUME_TEXT'
    } as AnalyzeResponse
  }

  try {
    updateSession(sessionId, { status: 'analyzing', jobDescription: jobDescription.trim() })

    const analysis = await analyzeWithAI({
      resumeText: session.normalizedText,
      jobDescription: jobDescription.trim()
    })

    updateSession(sessionId, {
      status: 'ready',
      analysis,
      jobDescription: jobDescription.trim()
    })

    return {
      success: true,
      message: 'Analysis completed',
      data: analysis
    } as AnalyzeResponse
  } catch (error) {
    console.error('Analysis failed:', error)
    updateSession(sessionId, { status: 'error' })

    return {
      success: false,
      message: 'Analysis failed',
      data: null,
      errorCode: 'ANALYSIS_ERROR'
    } as AnalyzeResponse
  }
})
