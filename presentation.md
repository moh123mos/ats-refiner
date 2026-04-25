# Software Testing & Quality Assurance Presentation

**Project:** ATS Refiner - AI-Powered Resume Analysis  
**Team Members**:
- **Muhammed Mustafa**
- **Bashar Mahmoud**
- **A'laa Muhammed**
- **Yassin Khalid**
- **Ammar Emad**
- **Muhammed Ragab**
- **Marwa Farid**  

---

## Project Snapshot

### ATS Refiner

An AI-powered Nuxt application that helps job seekers compare a resume against a job description and improve ATS compatibility.

**Core workflow**

- Upload a resume as PDF or DOCX.
- Extract resume text safely.
- Compare it against a target job description.
- Generate an ATS score, keyword gaps, and rewrite suggestions.

**Technology stack**

- **Frontend:** Nuxt 4, Vue 3, Pinia, Tailwind CSS, Nuxt UI
- **Backend:** Nitro server routes
- **AI:** Google Gemini with local mock fallback
- **Testing:** Vitest, Happy DOM, Playwright, V8 coverage

**Speaker note:** Start by framing the project as a real user workflow, not only a collection of tests. The testing strategy protects every stage of that workflow.

---

## Why Testing Matters Here

### The risk is not only a crash

ATS Refiner handles uploaded documents, AI responses, state transitions, and browser interactions. A failure in any layer can break the user experience.

**Main quality risks**

- Unsupported or malformed files could enter the parsing flow.
- AI responses may be invalid, incomplete, or unavailable.
- Frontend state could enable actions too early or too late.
- End-to-end behavior could fail even when isolated functions pass.

**Testing objective**

Build confidence that the application remains usable, predictable, and fault tolerant from upload to final analysis.

---

## Testing Strategy

### A layered testing pyramid

| Level | Purpose | Tool | Example Target |
| :--- | :--- | :--- | :--- |
| **Unit** | Prove core logic in isolation | Vitest | Parser and AI adapter |
| **Integration** | Verify modules work together | Vitest + Pinia | Session state and API flow |
| **System** | Validate the real user journey | Playwright | Resume upload to results page |
| **Regression** | Keep fixed bugs from returning | Vitest | Resume name extraction edge case |

**Principle:** Fast tests catch logic errors early. Browser tests prove the complete workflow still works.

**Speaker note:** Emphasize that each level has a different job. The goal is not simply "more tests"; it is the right test at the right layer.

---

## Unit Testing - Parser Service

### Proving file handling before the app depends on it

**File:** `server/services/parsing/parser.spec.ts`

**What we tested**

- `.pdf` files are detected correctly, including uppercase extensions.
- `.docx` files are detected correctly.
- Unsupported formats such as `.txt` and `.png` are rejected.
- PDF and DOCX parsing delegate to the correct parser path.

**Mocking strategy**

External document libraries are mocked so the test focuses on our parsing decisions, not the internal behavior of `pdf-parse` or `mammoth`.

**Demo command**

```bash
npm test
```

**Speaker note:** Point out that this test is fast and isolated. It catches bad file-routing logic without needing real document-processing overhead.

---

## Unit Testing - AI Adapter

### Making AI output testable

**File:** `server/services/ai/adapter.spec.ts`

**What we tested**

- Valid JSON from the AI is parsed into a structured analysis result.
- Matched and missing keywords are extracted.
- Contact information is preserved in the structured resume.
- Invalid AI output falls back to mock analysis instead of crashing.

**Quality value**

AI services are unpredictable external dependencies. The adapter test proves the application can still return a useful result when the AI response is malformed or unavailable.

**Speaker note:** This is the reliability story. The test does not assume the AI is always perfect; it verifies the system handles imperfect output safely.

---

## Integration Testing - State Management

### Testing the frontend decision logic

**File:** `app/stores/session.spec.ts`

**What we verified**

- The store starts in the `idle` state.
- Upload metadata moves the session into `ready`.
- The Analyze action remains disabled until a job description exists.
- Errors move the session into the `error` state with a visible message.

**Important transition**

```text
idle -> ready -> canAnalyze
idle -> error
```

**Why this matters**

The store controls whether users can continue through the workflow. Integration testing catches UI logic problems before they become user-facing defects.

---

## Regression Testing Story

### From bug to permanent safety check

**Bug discovered**

Resume name extraction could fail when a resume header line was longer than expected.

**Test-first fix**

1. Reproduce the failure with a focused test case.
2. Update the extraction logic.
3. Re-run the suite and confirm the test stays green.

**Why this is important**

The value of a regression test is that it turns a one-time bug fix into a permanent rule. If the same behavior breaks again, the test suite reports it immediately.

**Speaker note:** Present this as the clearest example of testing reducing future maintenance risk.

---

## System Testing - End-to-End Proof

### Testing what the user actually does

**File:** `tests/system-flow.spec.ts`

**Tool:** Playwright with Chromium

**Automated scenario**

1. Open the home page.
2. Upload `tests/fixtures/CV.pdf`.
3. Verify the selected file appears in the UI.
4. Fill the job description from `tests/fixtures/job-title.txt`.
5. Confirm the Analyze button becomes enabled.
6. Submit the analysis.
7. Verify navigation to `/results`.
8. Confirm the score appears on the results page.

**Demo command**

```bash
npm run test:e2e -- --headed
```

**Speaker note:** This is the strongest demo because it shows the browser performing the same workflow as a real user.

---

## Coverage & Build Quality

### Measuring confidence and production readiness

**Coverage command**

```bash
npm run test:coverage
```

**Build verification**

```bash
npm run build
```

**What these checks prove**

- Coverage shows which logic is protected by tests.
- The production build verifies Nuxt, Nitro, Pinia, and styling compile together.
- Build checks can expose issues that tests may miss, such as configuration and CSS ordering problems.

**Speaker note:** Coverage is not the final goal. It is a visibility tool that helps identify untested risk.

---

## Demo Plan

### Recommended live sequence

**1. Run unit and integration tests**

```bash
npm test
```

Point out the parser, AI adapter, store, and API tests.

**2. Run the browser system test**

```bash
npm run test:e2e -- --headed
```

Show the upload, job description entry, Analyze button, and results page.

**3. Optional coverage report**

```bash
npm run test:coverage
```

Use this only if time allows.

**Speaker note:** Keep the demo focused on evidence: green tests, visible browser behavior, and the connection between test cases and project risks.

---

## Final Summary

### Quality is built into the workflow

**What the test suite proves**

- Resume parsing handles supported and unsupported formats correctly.
- AI analysis is resilient to invalid or unavailable external responses.
- Frontend state prevents invalid user actions.
- The complete browser workflow works with real test fixtures.
- Regression tests protect fixes from returning.

**Future improvements**

- Add CI execution for every pull request.
- Expand visual regression coverage for the results page.
- Add more fixture resumes with different formats and layouts.
- Track coverage trends over time.

**Closing message**

ATS Refiner uses a practical testing pyramid to protect the user journey from the smallest parsing decision to the full end-to-end analysis flow.

---

## Q&A

**Thank you. Questions?**
