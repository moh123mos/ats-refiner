# ATS-Refiner MVP Execution Plan (Detailed)

## 1. Project Objective
Build a Nuxt 4 full-stack application that accepts a resume (PDF or DOCX), analyzes it against a job description, generates an ATS-focused improved version, and allows direct file download.

## 2. MVP Scope and Boundaries
### In scope
- File input support for PDF and DOCX only.
- Temporary session-based processing with a generated sessionId.
- End-to-end workflow: Upload -> Parse -> Analyze -> Display -> Download.
- Two main user screens: input screen and results screen.
- ATS score + actionable feedback + improved resume output.

### Out of scope (for MVP)
- Permanent persistence (MongoDB).
- Multi-user authentication and accounts.
- Historical dashboards and analytics.
- Additional file formats (TXT, RTF, ODT, image OCR).
- Collaborative editing.

## 3. Success Criteria
### Product criteria
- User can upload a valid PDF or DOCX and submit a job description.
- System returns ATS score, recommendations, and improved resume content.
- User can download the improved file in one click.

### Technical criteria
- API endpoints are stable and typed.
- Validation and errors are user-friendly.
- Core workflow succeeds for typical resumes under agreed size limits.
- Project builds without type errors.

## 4. Technology Baseline
- Frontend: Nuxt 4, Vue 3 Composition API, TypeScript, Tailwind CSS, Nuxt UI.
- State: Pinia.
- Server: Nitro API inside Nuxt.
- Parsing: mammoth for DOCX, pdf-parse for PDF.
- AI integration: Gemini through an isolated adapter service.
- Session storage: in-memory for local MVP; optional Redis-compatible adapter interface.

## 5. High-Level Architecture
### Frontend responsibilities
- Collect file and job description.
- Show processing state (idle, uploading, parsing, analyzing, ready, error).
- Render ATS score + recommendations + improved content preview.
- Trigger download endpoint using sessionId.

### API responsibilities
- POST /api/upload: validate file, extract raw text, normalize, store temporary session payload, return sessionId.
- POST /api/analyze: validate sessionId + job description, run AI analysis pipeline, store analysis result, return score + suggestions.
- GET /api/download/:sessionId: return generated improved file for download.

### Service layer responsibilities
- parsing service: file-type detection + extraction.
- cleaning service: text normalization and noise removal.
- structuring service: segment resume sections where possible.
- ai service: prompt builder + model adapter + response validator.
- storage service: temporary session read/write with TTL semantics.

## 6. Data Contracts (Initial)
### SessionState
- sessionId: string
- status: idle | uploading | parsing | analyzing | ready | error
- fileName: string
- fileType: pdf | docx
- rawText: string
- normalizedText: string
- jobDescription: string
- analysis: AnalysisResult | null
- createdAt: ISO timestamp
- expiresAt: ISO timestamp

### AnalysisResult
- atsScore: number (0-100)
- matchedKeywords: string[]
- missingKeywords: string[]
- rewriteSuggestions: string[]
- improvedResumeText: string
- warnings: string[]

### API Response Shape
- success: boolean
- message: string
- data: typed payload
- errorCode: optional string for predictable client handling

## 7. Validation Rules
- Accept only MIME and extension combinations for PDF and DOCX.
- Enforce max file size (define a clear threshold, for example 5-10 MB).
- Reject empty job description.
- Reject analysis request without valid active sessionId.
- Reject download request when analysis is not completed.

## 8. End-to-End User Flow
1. User drops or selects PDF/DOCX file.
2. Frontend sends FormData to upload endpoint.
3. Backend extracts and cleans text, stores temporary session, returns sessionId.
4. Frontend sends sessionId + job description to analyze endpoint.
5. Backend runs AI pipeline and stores analysis result.
6. Frontend navigates to results view and displays score + recommendations.
7. User clicks download and receives improved resume file.

## 9. Detailed Phase Plan

### Phase 1 - Foundation and Project Skeleton
#### Goal
Prepare a stable Nuxt 4 codebase with required libraries and folder structure.

#### Tasks
- Initialize Nuxt 4 project with TypeScript.
- Configure Tailwind CSS and Nuxt UI.
- Install and wire Pinia.
- Create base folders for pages, components, stores, server/api, server/services, server/utils, types.

#### Deliverables
- Running app with clean build.
- Base layout and placeholder pages.

#### Exit criteria
- npm run build (or equivalent) succeeds.
- No TypeScript configuration blockers.

### Phase 2 - Domain Types and Store Contracts
#### Goal
Establish explicit typed contracts before feature implementation.

#### Tasks
- Define shared TypeScript interfaces for session and analysis models.
- Implement session store contract in Pinia.
- Define status transitions and error model.

#### Deliverables
- Centralized types and store scaffolding.

#### Exit criteria
- All API handlers and UI layers can import and reuse shared types.

### Phase 3 - Upload and Parsing Pipeline
#### Goal
Implement robust upload flow for PDF and DOCX.

#### Tasks
- Build POST /api/upload endpoint.
- Add file type and size validation.
- Parse DOCX via mammoth and PDF via pdf-parse.
- Normalize extracted text and store temporary session payload.

#### Deliverables
- Reliable upload pipeline with structured errors.

#### Exit criteria
- Upload succeeds for valid sample PDF and DOCX.
- Unsupported file type returns predictable error response.

### Phase 4 - AI Analysis Pipeline
#### Goal
Generate ATS score and improved resume output from structured input.

#### Tasks
- Build POST /api/analyze endpoint.
- Implement prompt builder with strict output shape.
- Add Gemini adapter abstraction.
- Validate and sanitize AI response before returning it.

#### Deliverables
- Analysis endpoint returning score, suggestions, and improved text.

#### Exit criteria
- Analysis works with valid sessionId + job description.
- Malformed AI response is gracefully handled.

### Phase 5 - User Interface Flow
#### Goal
Deliver complete UX from upload to result display.

#### Tasks
- Implement input page with drag-and-drop and text area.
- Add progress states and error states.
- Build results page with ATS score breakdown and recommendations.
- Persist and read state via Pinia + sessionId.

#### Deliverables
- Functional two-page UI flow.

#### Exit criteria
- User can complete full workflow without manual API calls.

### Phase 6 - Download Pipeline
#### Goal
Provide one-click delivery of improved resume.

#### Tasks
- Build GET /api/download/:sessionId endpoint.
- Generate downloadable file content from improved text.
- Implement frontend Blob download trigger.

#### Deliverables
- Valid downloaded output file.

#### Exit criteria
- Download works after successful analysis only.

### Phase 7 - QA, Hardening, and Documentation
#### Goal
Stabilize behavior and confirm release readiness for MVP.

#### Tasks
- Add tests for upload validation and analyze flow.
- Verify edge cases (empty JD, expired session, bad file type).
- Improve error messages and UX fallback states.
- Document environment variables and run steps.

#### Deliverables
- Tested MVP workflow with documented setup.

#### Exit criteria
- Quality checklist is fully satisfied.

## 10. Quality Gates by Phase
- Build gate: project compiles and type checks.
- Contract gate: request/response types aligned between client and server.
- Behavior gate: each phase has at least one successful manual verification path.
- Regression gate: later phases do not break upload/analyze/download baseline.

## 11. Security and Privacy Baseline
- Do not store resumes permanently in MVP.
- Apply session expiration cleanup policy.
- Avoid logging full resume text in server logs.
- Validate all user input and file metadata.

## 12. Observability and Diagnostics
- Add request-level logging with correlation by sessionId.
- Capture parsing failure reasons.
- Capture AI response validation failures.
- Keep logs concise and non-sensitive.

## 13. Risk Register and Mitigation
- PDF extraction quality variance: add fallback cleaning and robust error handling.
- Hallucinated AI output: enforce strict output format and post-validation.
- Session loss in in-memory mode: keep MVP sessions short-lived and explicit.
- Slow processing on large files: enforce limits and clear user messaging.

## 14. Definition of Done (MVP)
- End-to-end flow works for PDF and DOCX only.
- Temporary sessions are used successfully with sessionId.
- ATS score + recommendations + improved text are displayed.
- Download endpoint returns final improved file.
- Errors are actionable and user-readable.
- Technical documentation is sufficient for local setup and testing.

## 15. Post-MVP Expansion Path
- Introduce Redis-backed distributed session storage.
- Add optional MongoDB persistence for history.
- Add user accounts and per-user result history.
- Add advanced scoring explainability and analytics panels.
