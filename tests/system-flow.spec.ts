import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const resumeFixtures = [
  { fileName: 'CV.pdf', shouldAnalyze: true },
  { fileName: 'CV2.pdf', shouldAnalyze: true },
  { fileName: 'CV3.pdf', shouldAnalyze: true },
  { fileName: 'CV4.pdf', shouldAnalyze: true },
  { fileName: 'CV-invalid.txt', shouldAnalyze: false }
]

const jobTitleFixtures = [
  'job-title.txt',
  'job-title-product-manager.txt'
]

test.describe('ATS Refiner System Flow', () => {
  test.setTimeout(120000)

  for (const resumeFixture of resumeFixtures) {
    for (const jobTitleFixture of jobTitleFixtures) {
      test(`${resumeFixture.fileName} against ${jobTitleFixture}`, async ({ page }) => {
        // 1. Visit the home page
        await page.goto('/')
        await expect(page).toHaveTitle(/ATS Refiner/)
        await page.waitForLoadState('load')
        await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined)
        await expect(page.locator('textarea')).toBeVisible()

        // 2. Upload a resume through the drop zone. This keeps the system flow
        // stable in automation while still exercising the app's drop handler.
        const filePath = path.resolve('tests/fixtures', resumeFixture.fileName)
        const selectedFileName = page.getByText(resumeFixture.fileName)

        const fileBytes = [...fs.readFileSync(filePath)]
        const dataTransfer = await page.evaluateHandle((file) => {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(
            new File([new Uint8Array(file.bytes)], file.name, { type: file.type })
          )
          return dataTransfer
        }, {
          name: resumeFixture.fileName,
          bytes: fileBytes,
          type: resumeFixture.shouldAnalyze ? 'application/pdf' : 'text/plain'
        })
        await page.locator('.border-dashed').dispatchEvent('drop', { dataTransfer })

        // 3. Enter Job Description
        const jdPath = path.resolve('tests/fixtures', jobTitleFixture)
        const jobDescription = fs.readFileSync(jdPath, 'utf8')
        await page.fill('textarea', jobDescription)

        if (!resumeFixture.shouldAnalyze) {
          const unsupportedFileError = page.getByText('Unsupported file type. Please upload PDF or DOCX.')
          await unsupportedFileError.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined)
          await page.waitForTimeout(3000)
          await expect(unsupportedFileError).toBeVisible()
          await expect(page.locator('button:has-text("Analyze")')).toBeDisabled()
          throw new Error(`${resumeFixture.fileName} was rejected by the system as an unsupported file type.`)
        }

        // Wait for the UI to show the selected file name.
        await expect(selectedFileName).toBeVisible({ timeout: 10000 })

        // 4. Wait for the Analyze button to be enabled.
        const analyzeButton = page.locator('button:has-text("Analyze")')
        await expect(analyzeButton).toBeEnabled({ timeout: 10000 })
        await analyzeButton.click()

        // 5. Verify Results Page
        await expect(page).toHaveURL(/\/results/, { timeout: 30000 })
        await expect(page.locator('text=Analysis Results')).toBeVisible()

        // Check if the score exists.
        const scoreLocator = page.locator('text=out of 100').locator('xpath=./preceding-sibling::div')
        await expect(scoreLocator).toBeVisible()
        const scoreText = await scoreLocator.innerText()
        console.log(
          `System Test Passed for ${resumeFixture.fileName} / ${jobTitleFixture} with ATS Score: ${scoreText}`
        )
        await page.waitForTimeout(3000)
      })
    }
  }
})
