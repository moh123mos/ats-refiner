export type SessionStatus = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'ready' | 'error'

export interface SessionState {
  sessionId: string
  status: SessionStatus
  fileName: string
  fileType: 'pdf' | 'docx'
  rawText: string
  normalizedText: string
  originalResumeText: string
  jobDescription: string
  analysis: AnalysisResult | null
  createdAt: string
  expiresAt: string
}

export interface ResumeContact {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
}

export interface ResumeExperience {
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface ResumeEducation {
  degree: string
  institution: string
  location: string
  graduationDate: string
  gpa: string
}

export interface ResumeProject {
  name: string
  description: string
  technologies: string[]
  bullets: string[]
}

export interface ResumeCertification {
  name: string
  issuer: string
  date: string
}

export interface StructuredResume {
  contact: ResumeContact
  summary: string
  experience: ResumeExperience[]
  education: ResumeEducation[]
  skills: string[]
  projects: ResumeProject[]
  certifications: ResumeCertification[]
  languages: string[]
}

export interface AnalysisResult {
  atsScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  rewriteSuggestions: string[]
  improvedResumeText: string
  structuredResume: StructuredResume
  warnings: string[]
}

export interface ApiErrorDetails {
  stage?: 'validation' | 'upload' | 'parsing' | 'analysis' | 'download'
  hint?: string
  technical?: string
  requestId?: string
}

export interface UploadResponse {
  success: boolean
  message: string
  data: {
    sessionId: string
    fileName: string
    fileType: 'pdf' | 'docx'
    textLength: number
    text: string
  } | null
  errorCode?: string
  details?: ApiErrorDetails
}

export interface AnalyzeRequest {
  sessionId: string
  jobDescription: string
}

export interface AnalyzeResponse {
  success: boolean
  message: string
  data: {
    atsScore: number
    matchedKeywords: string[]
    missingKeywords: string[]
    rewriteSuggestions: string[]
    improvedResumeText: string
    structuredResume: StructuredResume
    warnings: string[]
  } | null
  errorCode?: string
  details?: ApiErrorDetails
}

export interface DownloadResponse {
  success: boolean
  message: string
  data: {
    fileName: string
    content: string
    mimeType: string
  } | null
  errorCode?: string
  details?: ApiErrorDetails
}

export interface ApiErrorResponse {
  success: false
  message: string
  errorCode: string
  details?: ApiErrorDetails
}

export interface TemplateInfo {
  id: string
  name: string
  icon: string
  description: string
}

export interface Html2PdfOptions {
  margin?: number | number[]
  filename?: string
  image?: { type?: string, quality?: number }
  html2canvas?: Record<string, unknown>
  jsPDF?: Record<string, unknown>
  pagebreak?: { mode?: string | string[] }
  enableLinks?: boolean
}
