# ADR-002: Modular Dashboard Widget Platform

## Context
Adding new features to a unified Dashboard component introduces layout bloat and state management coupling.

## Decision
All dashboard sections are isolated as independent classes implementing the `DashboardWidget` contract and registered dynamically.

## Consequences
- Dashboard layout engine automates loader, lazy skeleton containers, and permission checks.
- Features plug in seamlessly without dashboard modification.
