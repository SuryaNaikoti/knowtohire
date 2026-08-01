# ADR-001: Supabase Repository Pattern

## Context
Direct database calls from presentation layouts tightly couple features to Supabase, making testing, mapping, and potential database migrations complex.

## Decision
We implement a lightweight `SupabaseRepository<T>` to expose standard query, pagination, filtering, and transaction utilities.

## Consequences
- Repositories are strictly lightweight.
- Business rules, validation, and analytics are isolated inside domain services.
