import { createRequire } from 'node:module'
import mammoth from 'mammoth'

export interface ParsedDocument {
  text: string
  pageCount?: number
}

export interface PdfParserDiagnostics {
  packageName: string
  parserImportPath: string
  workerImportPath: string
  parserResolvedPath: string | null
  workerResolvedPath: string | null
  workerLoaded: boolean
  canvasFactoryConfigured: boolean
  nodeVersion: string
  runtime: string
  platform: NodeJS.Platform
  arch: NodeJS.Architecture
  lastLoadError: string | null
}

type PdfTextParser = {
  getText: () => Promise<{ text: string, total?: number }>
  destroy: () => Promise<void>
}

type PdfParserConstructor = new (options: {
  data: Buffer
  CanvasFactory: unknown
}) => PdfTextParser

type PdfParserRuntime = {
  CanvasFactory: unknown
  PDFParse: PdfParserConstructor
}

const require = createRequire(import.meta.url)
const PDF_PARSE_PACKAGE_NAME = 'pdf-parse'
const PDF_PARSE_IMPORT_PATH = 'pdf-parse'
const PDF_PARSE_WORKER_IMPORT_PATH = 'pdf-parse/worker'

function safeResolve(specifier: string) {
  try {
    return require.resolve(specifier)
  } catch {
    return null
  }
}

const pdfParserState = {
  workerLoaded: false,
  canvasFactoryConfigured: false,
  lastLoadError: null as string | null
}

let pdfParserRuntimePromise: Promise<PdfParserRuntime> | null = null

function createPdfParserRuntimePromise() {
  return (async () => {
    try {
      // The worker import installs the canvas-backed polyfills used by pdf.js in Node/serverless runtimes.
      const workerModule = await import(PDF_PARSE_WORKER_IMPORT_PATH)
      pdfParserState.workerLoaded = true
      pdfParserState.canvasFactoryConfigured = Boolean(workerModule.CanvasFactory)
      pdfParserState.lastLoadError = null

      const parserModule = await import(PDF_PARSE_IMPORT_PATH)

      return {
        CanvasFactory: workerModule.CanvasFactory,
        PDFParse: parserModule.PDFParse as PdfParserConstructor
      }
    } catch (error) {
      pdfParserState.lastLoadError = error instanceof Error ? error.message : String(error)
      pdfParserRuntimePromise = null
      throw error
    }
  })()
}

async function loadPdfParserRuntime(): Promise<PdfParserRuntime> {
  if (!pdfParserRuntimePromise) {
    pdfParserRuntimePromise = createPdfParserRuntimePromise()
  }

  return pdfParserRuntimePromise
}

export function getPdfParserDiagnostics(): PdfParserDiagnostics {
  return {
    packageName: PDF_PARSE_PACKAGE_NAME,
    parserImportPath: PDF_PARSE_IMPORT_PATH,
    workerImportPath: PDF_PARSE_WORKER_IMPORT_PATH,
    parserResolvedPath: safeResolve(PDF_PARSE_IMPORT_PATH),
    workerResolvedPath: safeResolve(PDF_PARSE_WORKER_IMPORT_PATH),
    workerLoaded: pdfParserState.workerLoaded,
    canvasFactoryConfigured: pdfParserState.canvasFactoryConfigured,
    nodeVersion: process.version,
    runtime: process.release?.name || 'node',
    platform: process.platform,
    arch: process.arch,
    lastLoadError: pdfParserState.lastLoadError
  }
}

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  let parser: PdfTextParser | null = null

  try {
    const { PDFParse, CanvasFactory } = await loadPdfParserRuntime()
    parser = new PDFParse({ data: buffer, CanvasFactory })
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
