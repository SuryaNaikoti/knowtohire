# ADR-004: Domain Model Mapping Layer

## Context
Exposing database-generated persistence structures directly to frontend presentation layouts creates fragile code prone to breaking on database migrations.

## Decision
Implement Mapper utilities at the Repository boundary to translate Persistence Models into Domain Models before consumption by business services or UI widgets.

## Consequences
- Presentation components consume stable, type-safe structures.
- Schema migrations require changes only to mapping functions.
