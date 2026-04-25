import { generateSessionId, createSession, updateSession } from '../services/storage/session'
import { parseDocument, detectFileType, getPdfParserDiagnostics } from '../services/parsing/parser'
import { cleanResumeText } from '../services/cleaning/cleaner'
import type { UploadResponse } from '../../app/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function classifyParseError(error: unknown, fileType: 'pdf' | 'docx') {
  const technical = error instanceof Error ? error.message : 'Unknown parsing error'
  const normalized = technical.toLowerCase()

  if (normalized.includes('password')) {
    return {
      errorCode: 'PDF_PASSWORD_PROTECTED',
      message: 'This PDF is password-protected and cannot be parsed.',
      hint: 'Remove the password from the file, then upload again.'
    }
  }

  if (normalized.includes('invalid pdf') || normalized.includes('malformed') || normalized.includes('format')) {
    return {
      errorCode: 'INVALID_PDF_CONTENT',
      message: 'This PDF appears to be malformed or unreadable.',
      hint: 'Re-export the resume as a fresh PDF or DOCX, then retry.'
    }
  }

  return {
    errorCode: 'PARSE_ERROR',
    message: fileType === 'pdf' ? 'Failed to parse PDF file.' : 'Failed to parse DOCX file.',
    hint: 'Try saving the file again and upload a text-based PDF or DOCX.'
  }
}

export default defineEventHandler(async (event) => {
  const form = (await readMultipartFormData(event)) || []

  const file = form.find(part => part.name === 'file')
  if (!file) {
    return {
      success: false,
      message: 'No file uploaded',
      data: null,
      errorCode: 'NO_FILE'
    } as UploadResponse
  }

  if (!file.filename) {
    return {
      success: false,
      message: 'File has no filename',
      data: null,
      errorCode: 'INVALID_FILE'
    } as UploadResponse
  }

  const fileType = detectFileType(file.filename)
  if (!fileType) {
    return {
      success: false,
      message: 'Unsupported file type. Please upload PDF or DOCX.',
      data: null,
      errorCode: 'UNSUPPORTED_TYPE'
    } as UploadResponse
  }

  if (file.data.length > MAX_FILE_SIZE) {
    return {
      success: false,
      message: 'File too large. Maximum size is 10MB.',
      data: null,
      errorCode: 'FILE_TOO_LARGE'
    } as UploadResponse
  }

  const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (file.type && !allowedMimes.includes(file.type)) {
    return {
      success: false,
      message: 'Invalid file type. Please upload PDF or DOCX.',
      data: null,
      errorCode: 'INVALID_MIME'
    } as UploadResponse
  }

  try {
    const buffer = Buffer.from(file.data)
    const parsed = await parseDocument(buffer, fileType)
    const cleanedText = cleanResumeText(parsed.text)

    if (cleanedText.length < 50) {
      return {
        success: false,
        message: 'File appears to be empty or unreadable',
        data: null,
        errorCode: 'EMPTY_CONTENT'
      } as UploadResponse
    }

    const sessionId = generateSessionId()
    createSession(sessionId, file.filename, fileType)
    updateSession(sessionId, {
      rawText: cleanedText,
      normalizedText: cleanedText,
      originalResumeText: cleanedText,
      status: 'ready'
    })

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        sessionId,
        fileName: file.filename,
        fileType,
        textLength: cleanedText.length,
        text: cleanedText
      }
    } as UploadResponse
  } catch (error) {
    const requestId = crypto.randomUUID()
    const parsedError = classifyParseError(error, fileType)
    const pdfParserDiagnostics = fileType === 'pdf' ? getPdfParserDiagnostics() : null

    console.error(`[upload:${requestId}] Upload failed`, {
      fileName: file.filename,
      fileType,
      reason: error instanceof Error ? error.message : String(error),
      nodeVersion: process.version,
      pdfParser: pdfParserDiagnostics
    })

    return {
      success: false,
      message: parsedError.message,
      data: null,
      errorCode: parsedError.errorCode,
      details: {
        stage: 'parsing',
        hint: parsedError.hint,
        technical: error instanceof Error ? error.message : String(error),
        requestId
      }
    } as UploadResponse
  }
})
