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
| **Performance Payload** | Check payload limits and response time | Playwright + mocked AI | Large files and large job descriptions |
| **Concurrency** | Measure simultaneous API workflows | Node load script + mocked AI | Upload and analyze under parallel load |
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
2. Upload a resume fixture.
3. Verify the selected file appears in the UI.
4. Fill a job description fixture.
5. Confirm the Analyze button becomes enabled.
6. Submit the analysis.
7. Verify navigation to `/results`.
8. Confirm the score appears on the results page.

**Expanded test matrix**

The system test now uses a cross product:

- **5 CV inputs:** `CV.pdf`, `CV2.pdf`, `CV3.pdf`, `CV4.pdf`, `CV-invalid.txt`
- **2 job titles:** Backend Software Engineer and Product Manager
- **Total:** 5 x 2 = 10 system test cases

**Expected result**

- 8 valid PDF combinations pass and reach the analysis results page.
- 2 `.txt` combinations are rejected because the system only accepts PDF and DOCX.
- The invalid-file cases intentionally fail in the Playwright summary so the report clearly shows `8 passed, 2 failed`.
- Each case pauses for 3 seconds so the page state can be observed during the demo.

**Demo command**

```bash
npm run test:e2e -- --headed
```

**Speaker note:** This is the strongest demo because it shows the browser performing the same workflow as a real user.

---

## Performance Payload Testing

### Testing limits without depending on Gemini

**File:** `tests/performance-payload.spec.ts`

**Config:** `playwright.performance.config.ts`

**Why a separate config?**

The performance suite runs the app on port `3001` with:

```text
MOCK_AI=true
```

This forces local mock analysis, so the free Gemini API key, quota limits, and network latency do not affect the performance test results.

**Demo command**

```bash
pnpm run test:performance
```

**Speaker note:** Explain that performance tests must control external dependencies. Otherwise, the test measures Gemini availability instead of our application.

---

## Performance Payload Cases

### Boundary and response-time checks

| Test Case | Payload | Expected Behavior | Measured Time |
| :--- | :--- | :--- | :--- |
| Oversized resume | PDF over 10MB | Rejected before parsing | 3564ms |
| Oversized job description | 21,000 characters | Rejected by API validation | 2095ms |
| Near-limit job description | 19,900 characters | Accepted and analyzed with mock AI | 639ms |
| Tiny job description | Under 20 characters | Analyze button stays disabled | 94ms |

**Test result**

```text
4 passed (2.0m)
```

**Quality value**

- Confirms payload limits are enforced.
- Confirms invalid heavy inputs fail gracefully.
- Confirms large valid inputs still complete.
- Produces timing evidence that can be shown in the testing report.

**Speaker note:** These are not strict benchmark tests. They are payload boundary tests with timing measurements, which is more reliable for a student project and local machine demo.

---

## API Concurrency Testing

### How many requests can the system handle at once?

**File:** `scripts/concurrency-test.mjs`

**Demo command**

```bash
pnpm run test:concurrency
```

**What the test does**

- Starts Nuxt on a separate test port.
- Forces `MOCK_AI=true` so Gemini does not affect the result.
- Sends concurrent full API workflows:
  - upload `CV.pdf`
  - receive a session ID
  - call `/api/analyze`
  - verify successful analysis response
- Reports pass count, fail count, average latency, p95 latency, and throughput.

**Speaker note:** This is API-level concurrency testing, not browser testing. It measures backend capacity for simultaneous upload and analysis workflows.

---

## Concurrency Results

### Highest tested stable level: 100 concurrent workflows

**Default ramp**

| Concurrency | Passed | Failed | Avg ms | P95 ms | Req/s |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1 | 20 | 0 | 107 | 178 | 9.36 |
| 2 | 20 | 0 | 103 | 116 | 18.94 |
| 5 | 20 | 0 | 310 | 502 | 16.05 |
| 10 | 20 | 0 | 492 | 575 | 20.08 |
| 20 | 20 | 0 | 926 | 963 | 20.58 |

**Higher ramp**

| Concurrency | Passed | Failed | Avg ms | P95 ms | Req/s |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 30 | 40 | 0 | 2674 | 3555 | 10.8 |
| 50 | 40 | 0 | 2379 | 2404 | 16.48 |
| 75 | 40 | 0 | 2394 | 2403 | 16.49 |
| 100 | 40 | 0 | 2378 | 2388 | 16.58 |

**Conclusion**

In the local mocked-AI test environment, the system handled **100 concurrent upload+analyze workflows with 0 failures**. Throughput flattened around **16-20 requests per second**, so more concurrency increased waiting time more than throughput.

**Speaker note:** Say "highest tested stable level" instead of "absolute maximum." A real production number would require testing a production build on deployment hardware.

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

Show the upload, job description entry, Analyze button, and results page. Point out that the full matrix produces 8 valid passes and 2 intentional invalid-file failures.

**3. Run performance payload tests**

```bash
pnpm run test:performance
```

Show the timing logs for oversized upload, oversized job description, near-limit job description, and tiny job description.

**4. Run concurrency test**

```bash
pnpm run test:concurrency
```

Show the highest tested stable concurrency level and explain why Gemini is mocked.

**5. Optional coverage report**

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
- The complete browser workflow works across 10 CV/job-title combinations.
- Payload tests prove the app handles large and invalid inputs predictably.
- Performance tests use mocked AI so results are not affected by Gemini quota.
- Concurrency testing showed 100 simultaneous API workflows completed with 0 failures in the local mocked-AI environment.
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
