# Testing Plan: ATS Refiner

This document outlines the testing strategy for the ATS Refiner project, designed to satisfy the requirements for the "Software Testing" university course.

## 1. Testing Objectives
- Ensure robust parsing of various resume formats (PDF, DOCX).
- Validate the AI analysis logic and fallback mechanisms.
- Verify API endpoint security and data integrity.
- Guarantee a seamless user experience across the full application flow.
- Prevent regressions during the development lifecycle.

## 2. Testing Levels & Scope

### A. Unit Testing
**Focus:** Isolated business logic and utility functions.
**Tool:** Vitest
**Key Test Cases:**
- `parser.ts`:
    - `detectFileType()`: Correctly identifies .pdf and .docx.
    - `parseDocument()`: Returns text for valid buffers.
- `adapter.ts`:
    - `buildPrompt()`: Ensures the AI prompt contains necessary JD and Resume text.
    - `parseAIResponse()`: Handles malformed JSON and returns mock data safely.

### B. API Testing
**Focus:** Server-side endpoints (Nitro/Nuxt API).
**Tool:** Vitest (using `h3` event simulation or `supertest`)
**Key Test Cases:**
- `POST /api/upload`:
    - Success with valid PDF/DOCX.
    - Failure with unsupported file types.
- `POST /api/analyze`:
    - Success with valid SessionID and JD.
    - Failure with missing SessionID (400).
    - Failure with JD too short (< 20 chars).

### C. Integration Testing
**Focus:** Interaction between services (Storage + AI + Parser).
**Tool:** Vitest
**Key Test Cases:**
- Upload flow: Verify that `upload.post.ts` correctly triggers `parser.ts` and saves the result in `session.ts`.
- Analysis flow: Verify that `analyze.post.ts` retrieves the correct session data before calling the `adapter.ts`.

### D. System (End-to-End) Testing
**Focus:** The complete user journey from the browser.
**Tool:** Playwright
**Key Scenario:**
1. User lands on home page.
2. User uploads `resume.pdf`.
3. User navigates to the results/analyze page.
4. User enters a job description.
5. User clicks "Analyze".
6. System displays ATS score and suggestions.
7. User exports/previews the refined resume.

### E. Regression Testing
**Focus:** Ensuring bug fixes are permanent.
**Process:**
1. Identify a bug (e.g., "Empty skills array crashes UI").
2. Create a test case that reproduces the crash.
3. Fix the code.
4. Run the full suite to ensure no other features broke.

## 3. Environment & Tools
| Level | Tool |
| :--- | :--- |
| **Unit/API/Integration** | Vitest |
| **System (E2E)** | Playwright |
| **Code Coverage** | @vitest/coverage-v8 |
| **Mocking** | MSW (Mock Service Worker) for Gemini API |

## 4. Execution Schedule
1. **Phase 1:** Setup dependencies and Vitest configuration.
2. **Phase 2:** Implement Unit and API tests.
3. **Phase 3:** Implement Integration tests and E2E scenarios.
4. **Phase 4:** Run coverage reports and document Regression tests.
