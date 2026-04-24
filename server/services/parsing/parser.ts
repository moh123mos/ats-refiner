import mammoth from 'mammoth'

export interface ParsedDocument {
  text: string
  pageCount?: number
}

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  let parser: { getText: () => Promise<{ text: string, total?: number }>, destroy: () => Promise<void> } | null = null

  try {
    const { PDFParse } = await import('pdf-parse')
    parser = new PDFParse({ data: buffer })
    const data = await parser.getText()

    return {
      text: data.text || '',
      pageCount: typeof data.total === 'number' ? data.total : undefined
    }
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {
        // Ignore parser cleanup errors to avoid masking the real parsing error.
      })
    }
  }
}

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return {
      text: result.value || ''
    }
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function parseDocument(
  buffer: Buffer,
  fileType: 'pdf' | 'docx'
): Promise<ParsedDocument> {
  if (fileType === 'pdf') {
    return parsePdf(buffer)
  }
  return parseDocx(buffer)
}

export function detectFileType(filename: string): 'pdf' | 'docx' | null {
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  return null
}
