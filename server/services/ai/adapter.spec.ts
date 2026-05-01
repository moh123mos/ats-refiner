import { describe, it, expect } from 'vitest'
import { parseAIResponse, getMockAnalysis } from './adapter'

describe('AI Adapter Service', () => {
  const mockInput = {
    resumeText: "John Doe\nJavaScript developer with Vue experience.",
    jobDescription: 'Looking for a Senior JavaScript developer with Vue and Node.js skills.'
  }

  describe('parseAIResponse', () => {
    it('should correctly parse valid JSON response', () => {
      const mockAiText = JSON.stringify({
        atsScore: 85,
        matchedKeywords: ['JavaScript', 'Vue'],
        missingKeywords: ['Node.js'],
        rewriteSuggestions: ['Add Node.js projects'],
        improvedResumeText: 'Improved text...',
        structuredResume: {
          contact: { fullName: 'John Doe' }
        },
        warnings: []
      })

      const result = parseAIResponse(mockAiText, mockInput)
      expect(result.atsScore).toBe(85)
      expect(result.matchedKeywords).toContain('JavaScript')
      expect(result.structuredResume.contact.fullName).toBe('John Doe')
    })

    it('should fallback to mock analysis on invalid JSON', () => {
      const result = parseAIResponse('Invalid JSON string', mockInput)
      expect(result.warnings).toContain('AI analysis unavailable — using basic text extraction. Results may be incomplete.')
    })
  })

  describe('getMockAnalysis', () => {
    it('should calculate score based on keyword matching', () => {
      const result = getMockAnalysis(mockInput)
      expect(result.atsScore).toBeGreaterThanOrEqual(50)
      expect(result.matchedKeywords).toContain('javascript')
      expect(result.missingKeywords).toContain('node')
    })

    it('should extract contact info from resume text', () => {
      const result = getMockAnalysis(mockInput)
      expect(result.structuredResume.contact.fullName).toBe('John Doe')
    })
  })
})
