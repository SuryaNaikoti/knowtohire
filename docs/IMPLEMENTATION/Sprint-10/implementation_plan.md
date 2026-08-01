# Sprint 10 Implementation Plan - Career Intelligence & Smart Hiring Platform

This plan defines the execution roadmap, domain interfaces, and dynamic widget designs for Sprint 10.

---

## 1. Resume Intelligence Architecture

```
[Resume Upload (UI)]
        ↓
[ResumeParser (API)]
        ↓
[ResumeNormalizer]
        ↓
[SkillsExtractor] ➜ [KeywordAnalyzer]
        ↓
[ATSAnalyzer] ➜ [ResumeHealthCalculator]
        ↓
[CareerIntelligenceService]
        ↓
[AI Career Coach (Gemini)]
```

### Domain Contracts
- `IResumeParser`: Accepts document URI, returns plain text string.
- `IResumeNormalizer`: Accepts plain text, returns structured sections (experience, education, summary).
- `ISkillsExtractor`: Isolates skills matching the platform core capabilities registry.
- `IKeywordAnalyzer`: Checks document frequency of target keywords relative to the target role.
- `IATSAnalyzer`: Reviews formatting warnings (tables, margins, custom fonts).
- `IResumeHealthCalculator`: Deterministically calculates scores (0-100).

---

## 2. AI Career Coach (Gemini Provider Integration)

`AICareerCoachService` interacts strictly with the `AIProvider` interface.

### Specialized Methods
- `generateRoadmap(profile: DomainProfile): Promise<Roadmap>`
- `suggestResumeImprovements(resumeText: string): Promise<Suggestion[]>`
- `generateWeeklyGoals(completionScore: number): Promise<Goal[]>`
- `recommendCertifications(skills: string[]): Promise<Cert[]>`
- `simulateInterview(role: string): Promise<Question[]>`

---

## 3. Smart Job Matching Engine

Deterministic scoring pipeline with weighting weights:

```
[SkillMatchScorer (35%)] + [ExperienceMatchScorer (25%)] + [EducationMatchScorer (15%)] + [SalaryMatchScorer (15%)] + [LocationMatchScorer (10%)] = [MatchAggregator (100%)]
```

- **SkillMatchScorer**: Jaccard similarity index on required vs candidate skills.
- **ExperienceMatchScorer**: Chronological length alignment.
- **EducationMatchScorer**: Tier matching (e.g. Master vs Bachelor).
- **SalaryMatchScorer**: Checks if candidate salary fits within budget.
- **LocationMatchScorer**: Radial check or remote compatibility index.

---

## 4. Candidate Dashboard Widget Expansion

All new widgets implement the `DashboardWidget` interface lifecycle.

### New Widgets
1. **ResumeAnalyzerWidget**: Displays parsing feedback, keywords matching, formatting.
2. **CareerRoadmapWidget**: Interactive milestones learning timeline.
3. **SalaryInsightsWidget**: Salary benchmarks based on role and location.
4. **InterviewReadinessWidget**: Starts mock prep questions.
5. **LearningProgressWidget**: Displays started certifications and templates.
6. **RecommendedCertificationsWidget**: Curated list of badges.
7. **TrendingSkillsWidget**: Popular skills matching target roles.
8. **WeeklyGoalWidget**: Simple list of weekly tasks.
9. **CareerTimelineWidget**: Professional timeline events feed.
10. **UpcomingDeadlinesWidget**: Pending application deadlines.

---

## 5. Employer Foundations

We define contracts only (no full logic yet):
- `IEmployerPipelineService`: Manages candidate pipelines (Applied, Screening, Interview, Offered).
- `ICandidateShortlistService`: Allows recruiters to add profiles to custom folders.
- `ITalentPoolService`: Search indexing candidates matching target filters.
- `IInterviewQueueService`: Manages schedules for active vacancies.

---

## 6. Telemetry & Analytics Registry

Events standard structure:
```typescript
interface AnalyticsEvent {
  event: string;
  entity: string;
  entityId: string;
  candidateId: string;
  sessionId: string;
  timestamp: string;
  duration: number;
  success: boolean;
  metadata: any;
  source: string;
  version: string;
}
```
- `Resume Uploaded`
- `Resume Parsed`
- `Resume Analyzed`
- `Resume Improved`
- `Job Matched`
- `Job Saved`
- `Learning Started`
- `Certification Completed`
- `Weekly Goal Completed`
- `AI Coach Opened`
- `AI Recommendation Accepted`
- `Interview Practice Started`
