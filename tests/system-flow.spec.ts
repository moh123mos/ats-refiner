import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

test.describe('ATS Refiner System Flow', () => {
  test('should allow a user to upload a resume and see analysis results', async ({ page }) => {
    // 1. Visit the home page
    await page.goto('/')
    await expect(page).toHaveTitle(/ATS Refiner/)
    await page.waitForLoadState('networkidle')

    // 2. Upload a resume through the file input. This keeps the system flow
    // stable in automation while still exercising the app's change handler.
    const filePath = path.resolve('tests/fixtures/CV.pdf')
    await page.locator('input[type="file"]').setInputFiles(filePath)

    // Wait for the UI to show the selected file name
    // This proves the 'change' event fired and Vue updated the state
    await expect(page.locator('text=CV.pdf')).toBeVisible({ timeout: 10000 })

    // 3. Enter Job Description
    const jdPath = path.resolve('tests/fixtures/job-title.txt')
    const jobDescription = fs.readFileSync(jdPath, 'utf8')
    await page.fill('textarea', jobDescription)
    
    // 4. Wait for the Analyze button to be enabled 
    const analyzeButton = page.locator('button:has-text("Analyze")')
    await expect(analyzeButton).toBeEnabled({ timeout: 10000 })
    await analyzeButton.click()

    // 5. Verify Results Page
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 })
    await expect(page.locator('text=Analysis Results')).toBeVisible()
    
    // Check if the score exists
    const scoreLocator = page.locator('text=out of 100').locator('xpath=./preceding-sibling::div')
    await expect(scoreLocator).toBeVisible()
    const scoreText = await scoreLocator.innerText()
    console.log(`System Test Passed with ATS Score: ${scoreText}`)
  })
})
