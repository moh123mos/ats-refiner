# OpenCode Prompt - ATS-Refiner MVP (Detailed)

Use this prompt as the exact operating brief for OpenCode.

## Role
You are a senior full-stack engineer implementing ATS-Refiner as a Nuxt 4 MVP.

## Product Goal
Deliver a complete resume refinement workflow:
1. Upload resume file (PDF or DOCX).
2. Submit job description.
3. Parse and normalize resume text.
4. Run ATS-focused AI analysis.
5. Show score, gaps, and improved resume text.
6. Download improved result file.

## Non-Negotiable MVP Constraints
- Support only PDF and DOCX input.
- Use temporary session storage only.
- Do not introduce MongoDB or permanent persistence in MVP.
- Keep architecture clean: API layer, service layer, adapter layer.
- Use TypeScript everywhere possible.
- Use sessionId as the flow key across upload, analyze, and download.

## Technical Stack
- Nuxt 4 + Vue 3 + Composition API + TypeScript.
- Tailwind CSS + Nuxt UI.
- Pinia for client-side workflow state.
- Nitro server routes for backend APIs.
- mammoth for DOCX extraction.
- pdf-parse for PDF extraction.
- Gemini model through isolated adapter service.

## Execution Protocol
- Work phase-by-phase.
- Do not start a new phase until the current phase passes its validation gate.
- At the start of each phase, write a short implementation plan.
- At the end of each phase, output:
	- files created/updated
	- tests/checks run
	- known issues
	- next phase readiness
- If an assumption is required, state it explicitly before implementation.

## Commit Protocol (Strict)
For each completed phase, create exactly 5 commits with emoji-style commit messages.
Keep each commit focused and meaningful.

## Required Folder Blueprint
- pages/
- components/upload/
- components/results/
- stores/
- server/api/
- server/services/parsing/
- server/services/cleaning/
- server/services/ai/
- server/services/storage/
- server/utils/
- types/

## Data Contracts to Implement Early
- SessionState
- UploadResponse
- AnalyzeRequest
- AnalysisResponse
- DownloadResponse
- ApiErrorResponse

Include typed status values:
- idle
- uploading
- parsing
- analyzing
- ready
- error

## API Contract Targets
### POST /api/upload
Input:
- multipart/form-data with file

Behavior:
- validate extension and MIME
- reject unsupported files
- parse text (PDF/DOCX)
- normalize text
- create session
- return sessionId and metadata

### POST /api/analyze
Input:
- sessionId
- jobDescription

Behavior:
- validate session
- validate non-empty job description
- run AI analysis via adapter
- store analysis result in session
- return ATS score, keyword analysis, suggestions, improved text

### GET /api/download/:sessionId
Behavior:
- validate session and analysis readiness
- generate downloadable file
- return binary payload with proper headers

## Phase Plan

### Phase 1 - Project Initialization
Objectives:
- initialize Nuxt 4 app
- configure TypeScript, Tailwind, Nuxt UI, Pinia
- scaffold folder structure

Validation gate:
- app starts
- build/typecheck passes

### Phase 2 - Core Types and State Model
Objectives:
- define shared types in types/
- build Pinia session store with status transitions
- establish API response envelope

Validation gate:
- no duplicate type definitions across app
- store state transitions are deterministic

### Phase 3 - Upload and Parsing Pipeline
Objectives:
- implement POST /api/upload
- add strict validation rules
- parse PDF and DOCX
- clean and normalize extracted text
- store session payload

Validation gate:
- valid PDF upload succeeds
- valid DOCX upload succeeds
- unsupported extension returns structured error

### Phase 4 - AI Analysis Pipeline
Objectives:
- implement POST /api/analyze
- create prompt builder service
- implement Gemini adapter
- post-validate AI output shape

Validation gate:
- returns deterministic response shape
- malformed AI output handled gracefully

### Phase 5 - Frontend Workflow UI
Objectives:
- build upload screen with drag and drop
- add job description textarea
- integrate progress states
- build results screen
- connect store + APIs

Validation gate:
- full flow works from UI only
- error states are visible and actionable

### Phase 6 - Download Delivery
Objectives:
- implement GET /api/download/:sessionId
- generate downloadable output
- connect frontend Blob download flow

Validation gate:
- download succeeds after analysis
- invalid sessionId returns clear error

### Phase 7 - Hardening and QA
Objectives:
- test critical flows and edge cases
- improve error handling and messages
- document environment setup and run instructions

Validation gate:
- upload/analyze/download all pass manual QA
- key edge cases handled

## Testing Checklist per Phase
- Type checks pass.
- Lint checks pass (if configured).
- Manual smoke test for affected flow passes.
- No regression on previously completed flows.

## Security and Privacy Rules
- Never log full resume text in plaintext logs.
- Apply session expiration policy.
- Validate all user inputs at API boundary.
- Return generic, safe server errors to client.

## Output Format Required from OpenCode
After each phase, respond in this template:

PHASE REPORT
- Phase: <number and name>
- Summary of work completed
- Files changed
- Validation performed
- Remaining risks
- Next phase plan

If blocked, respond with:
- Blocker
- Root cause
- Proposed fix options (at least 2)
- Recommended option

## Final Delivery Conditions
The implementation is accepted only when:
- PDF and DOCX workflow is fully operational.
- Session-based upload/analyze/download path is stable.
- ATS result and improved content are visible in UI.
- Download works end-to-end.
- No scope creep beyond MVP constraints.
