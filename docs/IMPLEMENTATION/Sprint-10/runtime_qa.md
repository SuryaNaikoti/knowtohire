# Sprint 10 Runtime QA Strategy

This document details the QA checklists for testing Sprint 10 features in a live browser execution context.

---

## 1. Resume Analyzer
- Verify file uploads (PDF, DOCX) and confirm error handling for unsupported file extensions.
- Confirm ATS health index increases when missing keywords are added to the profile.

---

## 2. AI Career Coach
- Test learning roadmap milestones rendering.
- Verify mock interview session questions load dynamically and keyboard navigation works inside the questionnaire.

---

## 3. Dynamic Dashboard Widgets
- Check that all 10 new widgets populate correctly inside the dashboard container grid.
- Verify permission checks: widgets with the 'recruiter' permission must not render for candidate logins.
