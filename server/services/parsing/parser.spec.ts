import { describe, it, expect, vi } from 'vitest'
import { detectFileType, parseDocument } from './parser'

// Mock mammoth and pdf-parse
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn().mockResolvedValue({ value: 'Mocked DOCX text' })
  }
}))

vi.mock('pdf-parse', () => {
  class MockPDFParse {
    async getText() {
      return { text: 'Mocked PDF text', total: 1 }
    }
    async destroy() {}
  }
  return { PDFParse: MockPDFParse }
})

describe('Parser Service', () => {
  describe('detectFileType', () => {
    it('should detect PDF files', () => {
      expect(detectFileType('resume.pdf')).toBe('pdf')
      expect(detectFileType('RESUME.PDF')).toBe('pdf')
    })

    it('should detect DOCX files', () => {
      expect(detectFileType('resume.docx')).toBe('docx')
    })

    it('should return null for unsupported files', () => {
      expect(detectFileType('resume.txt')).toBeNull()
      expect(detectFileType('image.png')).toBeNull()
    })
  })

  describe('parseDocument', () => {
    it('should call parsePdf for pdf type', async () => {
      const buffer = Buffer.from('dummy pdf')
      const result = await parseDocument(buffer, 'pdf')
      expect(result.text).toBe('Mocked PDF text')
      expect(result.pageCount).toBe(1)
    })

    it('should call parseDocx for docx type', async () => {
      const buffer = Buffer.from('dummy docx')
      const result = await parseDocument(buffer, 'docx')
      expect(result.text).toBe('Mocked DOCX text')
    })
  })
})
