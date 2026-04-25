# ATS Refiner 🚀

ATS Refiner is an AI-powered resume optimization tool built with Nuxt 3. It helps job seekers analyze their resumes against specific job descriptions to identify keyword gaps and improve their ATS (Applicant Tracking System) scores.

## 🛠️ Tech Stack
- **Framework:** Nuxt 4 (Vue 3)
- **State Management:** Pinia
- **Styling:** Tailwind CSS / Nuxt UI
- **AI Engine:** Google Gemini AI (with Mock fallback)
- **Testing:** Vitest & Playwright

## 🧪 Testing Suite (Academic Focus)
This project was developed with a heavy emphasis on Quality Assurance and Software Testing principles.

### 1. Unit Testing (Vitest)
Tests individual logic units in isolation (Parsing, AI response handling, text extraction).
```bash
npm test
```

### 2. Integration Testing (Pinia)
Tests the interaction between the frontend state and business logic.
```bash
npm test
```

### 3. System Testing (Playwright)
End-to-end browser automation using real test fixtures.
```bash
# First time setup
npx playwright install

# Run system tests (Headed mode recommended for demos)
npx playwright test --headed
```

### 4. Code Coverage
Generates a detailed report of how much code is covered by automated tests.
```bash
npm run test:coverage
```

## 📂 Project Structure
- `app/stores/`: Frontend state management (Integrated tests here).
- `server/services/`: Core logic for parsing and AI (Unit tests here).
- `tests/system-flow.spec.ts`: Playwright E2E scenarios.
- `tests/fixtures/`: Real-world test data (CVs and Job Descriptions).
- `draft/`: Academic testing reports and presentation drafts.

## 🚀 Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run the full test suite: `npm test && npm run test:e2e`
