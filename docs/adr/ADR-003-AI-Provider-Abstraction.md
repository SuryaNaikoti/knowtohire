# ADR-003: AI Provider Abstraction

## Context
Tying AI insights directly to Gemini APIs limits platform portability and testing.

## Decision
Create an `AIProvider` interface contract. `AICareerInsightsService` depends solely on this interface.

## Consequences
- Allows swapping between Gemini, OpenAI, Claude, and mock local providers.
- Simplifies offline testing.
