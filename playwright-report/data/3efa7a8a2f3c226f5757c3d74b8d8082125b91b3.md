# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: system-flow.spec.ts >> ATS Refiner System Flow >> CV-invalid.txt against job-title.txt
- Location: tests\system-flow.spec.ts:23:7

# Error details

```
Error: CV-invalid.txt was rejected by the system as an unsupported file type.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e8]: AI-Powered Resume Analysis
        - heading "Make Your Resume ATS-Ready" [level=1] [ref=e10]:
          - text: Make Your Resume
          - text: ATS-Ready
        - paragraph [ref=e11]: Upload your resume, paste the job description, and get AI-powered analysis with actionable suggestions to improve your chances with ATS systems.
        - generic [ref=e12]:
          - paragraph [ref=e16]: ATS Score Analysis
          - paragraph [ref=e20]: Keyword Matching
          - paragraph [ref=e24]: Improvement Tips
      - generic [ref=e26]:
        - generic [ref=e28] [cursor=pointer]:
          - generic [ref=e31]:
            - paragraph [ref=e32]: Drop your resume here
            - paragraph [ref=e33]: PDF or DOCX • Max 10MB
          - button "Browse Files" [ref=e34]: Browse Files
        - generic [ref=e36]:
          - generic [ref=e37]: Job Description
          - textbox "Paste the job description here to get tailored recommendations..." [active] [ref=e40]: "Job Title: Software Engineer (Backend) Location: Remote / Hybrid Experience Level: Mid-Level (3–5 years) About the Role: We’re looking for a skilled Software Engineer to help design, build, and maintain scalable backend systems. You’ll work closely with cross-functional teams including product managers, designers, and frontend engineers to deliver high-quality software solutions. Responsibilities: Design, develop, and maintain backend services and APIs Write clean, efficient, and well-documented code Collaborate with team members to define system architecture Troubleshoot, debug, and optimize performance issues Participate in code reviews and contribute to best practices Implement security and data protection measures Work with databases (SQL/NoSQL) and cloud infrastructure Required Qualifications: Bachelor’s degree in Computer Science or related field (or equivalent experience) 3+ years of experience in backend development Proficiency in at least one language (e.g., Python, Java, Node.js, Go) Experience building RESTful APIs Familiarity with databases like PostgreSQL, MySQL, or MongoDB Understanding of version control systems (e.g., Git) Preferred Qualifications: Experience with cloud platforms (AWS, Azure, or GCP) Knowledge of containerization (Docker, Kubernetes) Familiarity with microservices architecture Basic understanding of CI/CD pipelines What We Offer: Competitive salary and benefits Flexible working hours Opportunity for growth and learning Collaborative and supportive team environment"
          - paragraph [ref=e41]: Minimum 20 characters for meaningful analysis
        - button "Analyze Resume" [disabled] [ref=e42]: Analyze Resume
        - generic [ref=e47]:
          - paragraph [ref=e48]: Unsupported file type. Please upload PDF or DOCX.
          - paragraph [ref=e49]: Only PDF and DOCX files are supported in this MVP.
          - paragraph [ref=e50]: "Code: UNSUPPORTED_TYPE"
    - contentinfo [ref=e51]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - paragraph [ref=e55]: Designed & Built by
          - heading "Muhammed Mustafa" [level=3] [ref=e56]
        - generic [ref=e57]:
          - link "LinkedIn" [ref=e58] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/mhamed-mstafa/
            - img [ref=e59]
            - generic [ref=e61]: LinkedIn
          - link "GitHub" [ref=e62] [cursor=pointer]:
            - /url: https://github.com/moh123mos
            - img [ref=e63]
            - generic [ref=e65]: GitHub
          - link "Email" [ref=e66] [cursor=pointer]:
            - /url: mailto:muhammed.mustafa.work@gmail.com
            - img [ref=e67]
            - generic [ref=e69]: Email
        - paragraph [ref=e70]: © 2026 ATS Refiner. All rights reserved.
  - region "Notifications (F8)":
    - list
  - generic:
    - img
  - generic [ref=e71]:
    - button "Toggle Nuxt DevTools" [ref=e72] [cursor=pointer]:
      - img [ref=e73]
    - generic "Page load time" [ref=e76]:
      - generic [ref=e77]: "266"
      - generic [ref=e78]: ms
    - button "Toggle Component Inspector" [ref=e80] [cursor=pointer]:
      - img [ref=e81]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import fs from 'node:fs'
  3  | import path from 'node:path'
  4  | 
  5  | const resumeFixtures = [
  6  |   { fileName: 'CV.pdf', shouldAnalyze: true },
  7  |   { fileName: 'CV2.pdf', shouldAnalyze: true },
  8  |   { fileName: 'CV3.pdf', shouldAnalyze: true },
  9  |   { fileName: 'CV4.pdf', shouldAnalyze: true },
  10 |   { fileName: 'CV-invalid.txt', shouldAnalyze: false }
  11 | ]
  12 | 
  13 | const jobTitleFixtures = [
  14 |   'job-title.txt',
  15 |   'job-title-product-manager.txt'
  16 | ]
  17 | 
  18 | test.describe('ATS Refiner System Flow', () => {
  19 |   test.setTimeout(120000)
  20 | 
  21 |   for (const resumeFixture of resumeFixtures) {
  22 |     for (const jobTitleFixture of jobTitleFixtures) {
  23 |       test(`${resumeFixture.fileName} against ${jobTitleFixture}`, async ({ page }) => {
  24 |         // 1. Visit the home page
  25 |         await page.goto('/')
  26 |         await expect(page).toHaveTitle(/ATS Refiner/)
  27 |         await page.waitForLoadState('load')
  28 |         await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined)
  29 |         await expect(page.locator('textarea')).toBeVisible()
  30 | 
  31 |         // 2. Upload a resume through the drop zone. This keeps the system flow
  32 |         // stable in automation while still exercising the app's drop handler.
  33 |         const filePath = path.resolve('tests/fixtures', resumeFixture.fileName)
  34 |         const selectedFileName = page.getByText(resumeFixture.fileName)
  35 | 
  36 |         const fileBytes = [...fs.readFileSync(filePath)]
  37 |         const dataTransfer = await page.evaluateHandle((file) => {
  38 |           const dataTransfer = new DataTransfer()
  39 |           dataTransfer.items.add(
  40 |             new File([new Uint8Array(file.bytes)], file.name, { type: file.type })
  41 |           )
  42 |           return dataTransfer
  43 |         }, {
  44 |           name: resumeFixture.fileName,
  45 |           bytes: fileBytes,
  46 |           type: resumeFixture.shouldAnalyze ? 'application/pdf' : 'text/plain'
  47 |         })
  48 |         await page.locator('.border-dashed').dispatchEvent('drop', { dataTransfer })
  49 | 
  50 |         // 3. Enter Job Description
  51 |         const jdPath = path.resolve('tests/fixtures', jobTitleFixture)
  52 |         const jobDescription = fs.readFileSync(jdPath, 'utf8')
  53 |         await page.fill('textarea', jobDescription)
  54 | 
  55 |         if (!resumeFixture.shouldAnalyze) {
  56 |           const unsupportedFileError = page.getByText('Unsupported file type. Please upload PDF or DOCX.')
  57 |           await unsupportedFileError.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined)
  58 |           await page.waitForTimeout(3000)
  59 |           await expect(unsupportedFileError).toBeVisible()
  60 |           await expect(page.locator('button:has-text("Analyze")')).toBeDisabled()
> 61 |           throw new Error(`${resumeFixture.fileName} was rejected by the system as an unsupported file type.`)
     |                 ^ Error: CV-invalid.txt was rejected by the system as an unsupported file type.
  62 |         }
  63 | 
  64 |         // Wait for the UI to show the selected file name.
  65 |         await expect(selectedFileName).toBeVisible({ timeout: 10000 })
  66 | 
  67 |         // 4. Wait for the Analyze button to be enabled.
  68 |         const analyzeButton = page.locator('button:has-text("Analyze")')
  69 |         await expect(analyzeButton).toBeEnabled({ timeout: 10000 })
  70 |         await analyzeButton.click()
  71 | 
  72 |         // 5. Verify Results Page
  73 |         await expect(page).toHaveURL(/\/results/, { timeout: 30000 })
  74 |         await expect(page.locator('text=Analysis Results')).toBeVisible()
  75 | 
  76 |         // Check if the score exists.
  77 |         const scoreLocator = page.locator('text=out of 100').locator('xpath=./preceding-sibling::div')
  78 |         await expect(scoreLocator).toBeVisible()
  79 |         const scoreText = await scoreLocator.innerText()
  80 |         console.log(
  81 |           `System Test Passed for ${resumeFixture.fileName} / ${jobTitleFixture} with ATS Score: ${scoreText}`
  82 |         )
  83 |         await page.waitForTimeout(3000)
  84 |       })
  85 |     }
  86 |   }
  87 | })
  88 | 
```