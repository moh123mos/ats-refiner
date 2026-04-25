import { defineStore } from 'pinia'
import type { SessionStatus, AnalysisResult } from '~/types'

interface StoreError {
  message: string
  code?: string
  hint?: string
  requestId?: string
}

interface SessionStoreState {
  sessionId: string | null
  status: SessionStatus
  fileName: string
  fileType: 'pdf' | 'docx'
  rawText: string
  normalizedText: string
  originalResumeText: string
  jobDescription: string
  analysis: AnalysisResult | null
  error: StoreError | null
  activeTemplate: string
}

export const useSessionStore = defineStore('session', {
  state: (): SessionStoreState => ({
    sessionId: null,
    status: 'idle',
    fileName: '',
    fileType: 'pdf',
    rawText: '',
    normalizedText: '',
    originalResumeText: '',
    jobDescription: '',
    analysis: null,
    error: null,
    activeTemplate: 'classic'
  }),

  actions: {
    setStatus(status: SessionStatus) {
      this.status = status
    },

    setError(error: StoreError | null) {
      this.error = error
      if (error) this.status = 'error'
    },

    setSession(data: { sessionId: string, fileName: string, fileType: 'pdf' | 'docx', textLength: number }) {
      this.sessionId = data.sessionId
      this.fileName = data.fileName
      this.fileType = data.fileType
      this.status = 'ready'
      this.rawText = ''
      this.normalizedText = ''
    },

    setNormalizedText(text: string) {
      this.normalizedText = text
    },

    setJobDescription(jd: string) {
      this.jobDescription = jd
    },

    setAnalysis(analysis: AnalysisResult) {
      this.analysis = analysis
      this.status = 'ready'
    },

    setOriginalResumeText(text: string) {
      this.originalResumeText = text
    },

    setActiveTemplate(templateId: string) {
      this.activeTemplate = templateId
    },

    reset() {
      this.sessionId = null
      this.status = 'idle'
      this.fileName = ''
      this.fileType = 'pdf'
      this.rawText = ''
      this.normalizedText = ''
      this.originalResumeText = ''
      this.jobDescription = ''
      this.analysis = null
      this.error = null
      this.activeTemplate = 'classic'
    }
  },

  getters: {
    isReady: state => state.status === 'ready' && state.analysis !== null,
    hasError: state => state.status === 'error' || state.error !== null,
    canAnalyze: state => state.sessionId !== null && state.jobDescription.length > 0
  }
})
