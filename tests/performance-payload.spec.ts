import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const NORMAL_JOB_DESCRIPTION = fs.readFileSync(
  path.resolve('tests/fixtures/job-title.txt'),
  'utf8'
)

function largeJobDescription(targetLength: number): string {
  const base = [
    'Job Title: Backend Performance Engineer',
    'Responsibilities:',
    'Design scalable APIs and services.',
    'Optimize SQL queries, caching, queues, and distributed systems.',
    'Measure latency, throughput, and reliability for production workloads.',
    'Required skills: TypeScript, Node.js, PostgreSQL, Docker, Kubernetes, CI/CD.'
  ].join('\n')

  const filler = '\n- Performance payload testing validates large but realistic job descriptions.'
  return (base + filler.repeat(Math.ceil((targetLength - base.length) / filler.length))).slice(0, targetLength)
}

async function openHome(page: Page) {
  await page.goto('/')
  await expect(page).toHaveTitle(/ATS Refiner/)
  await page.waitForLoadState('load')
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined)
  await expect(page.locator('textarea')).toBeVisible()
}

async function dropFile(page: Page, options: { fileName: string, bytes?: number[], size?: number, type: string }) {
  const dataTransfer = await page.evaluateHandle((file) => {
    const dataTransfer = new DataTransfer()
    const bytes = file.bytes
      ? new Uint8Array(file.bytes)
      : new Uint8Array(file.size ?? 0)
    dataTransfer.items.add(
      new File([bytes], file.fileName, { type: file.type })
    )
    return dataTransfer
  }, options)

  await page.locator('.border-dashed').dispatchEvent('drop', { dataTransfer })
}

async function dropFixture(page: Page, fileName: string) {
  const filePath = path.resolve('tests/fixtures', fileName)
  await dropFile(page, {
    fileName,
    bytes: [...fs.readFileSync(filePath)],
    type: 'application/pdf'
  })
  await expect(page.getByText(fileName)).toBeVisible({ timeout: 10000 })
}

function logDuration(label: string, startedAt: number) {
  const durationMs = Math.round(performance.now() - startedAt)
  console.log(`[payload-performance] ${label}: ${durationMs}ms`)
}

test.describe('Performance Payload Tests', () => {
  test('rejects an oversized resume upload before parsing', async ({ page }) => {
    await openHome(page)

    const startedAt = performance.now()
    await dropFile(page, {
      fileName: 'oversized-resume.pdf',
      size: MAX_UPLOAD_BYTES + 1,
      type: 'application/pdf'
    })
    await page.fill('textarea', NORMAL_JOB_DESCRIPTION)
    await page.locator('button:has-text("Analyze")').click()

    await expect(page.getByText('File too large. Maximum size is 10MB.')).toBeVisible({
      timeout: 30000
    })
    await expect(page).not.toHaveURL(/\/results/)
    logDuration('oversized resume rejected', startedAt)
  })

  test('rejects a job description above the API payload limit', async ({ page }) => {
    await openHome(page)
    await dropFixture(page, 'CV.pdf')
    await page.fill('textarea', largeJobDescription(21000))

    const startedAt = performance.now()
    await page.locator('button:has-text("Analyze")').click()

    await expect(page.getByText('Job description is too large (maximum 20,000 characters)')).toBeVisible({
      timeout: 30000
    })
    await expect(page).not.toHaveURL(/\/results/)
    logDuration('oversized job description rejected', startedAt)
  })

  test('accepts a near-limit job description using mocked AI analysis', async ({ page }) => {
    await openHome(page)
    await dropFixture(page, 'CV.pdf')
    await page.fill('textarea', largeJobDescription(19900))

    const startedAt = performance.now()
    await page.locator('button:has-text("Analyze")').click()

    await expect(page).toHaveURL(/\/results/, { timeout: 60000 })
    await expect(page.locator('text=Analysis Results')).toBeVisible()
    logDuration('near-limit job description analyzed with mock AI', startedAt)
  })

  test('keeps analysis disabled for a tiny job description', async ({ page }) => {
    await openHome(page)
    await dropFixture(page, 'CV.pdf')

    const startedAt = performance.now()
    await page.fill('textarea', 'too short')

    await expect(page.locator('button:has-text("Analyze")')).toBeDisabled()
    logDuration('tiny job description blocked on client', startedAt)
  })
})
