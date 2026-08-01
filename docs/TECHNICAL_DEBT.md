# Technical Debt Registry

This register tracks outstanding technical debt and refactoring tasks.

---

## 1. Candidate Onboarding Offline Queue
- **Area**: Draft Persistence
- **Details**: Draft caching currently targets `localStorage` only.
- **Remediation**: In future sprints, implement `IndexedDB` providers to support larger profiles and media attachments.

---

## 2. Gemini Real-time Stream Parsing
- **Area**: AI Insights
- **Details**: Insights currently resolve block-by-block.
- **Remediation**: Transition provider to support text-streaming APIs.

---

## 3. Resume OCR & PDF Extractor Refinements
- **Area**: Resume Analyzer
- **Details**: Plain text parsing currently relies on standard string extraction.
- **Remediation**: Integrate OCR tools for image-based PDFs and multi-language support.

---

## 4. UI Type Safety Refinement
- **Area**: Presentation Layer
- **Details**: Unavoidable type-casting (`profile as any`) remains at context borders due to incomplete user profile schemas in auth context definition.
- **Remediation**: Align context credentials schema declarations with PostgreSQL candidate database schemas.

---

## 5. Automated CI E2E Tests Integration
- **Area**: CI/CD Pipelines
- **Details**: E2E tests currently run in manual emulators.
- **Remediation**: Configure Github Actions runner using headless browsers to run regressions automatically on main pull requests.
