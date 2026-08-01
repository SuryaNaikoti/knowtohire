# Engineering Blueprint - Permanent Standards

This document establishes the system-wide software engineering and governance standards for the KnowToHire platform.

---

## 1. Architectural Layers & Flow Rules

Strict separation must be maintained between the layers of the application. Bypassing layers (e.g., querying the database directly from UI widgets) is strictly prohibited.

```
[Presentation Layer: Widgets & Pages]
                  ↓
[Application Layer: Business Services]
                  ↓
[Domain Layer: Contracts & Models]
                  ↓
[Persistence Layer: Mappers & Repositories]
                  ↓
[Infrastructure Layer: Database / External APIs]
```

### Flow Direction Rules
1. **Presentation Layer** depends only on **Application Services**.
2. **Business Services** operate only on **Domain Models** and call **Domain Contracts**.
3. **Repositories** execute low-level database operations and map results from persistence tables to domain-safe entities.

---

## 2. Coding Conventions

- **SOLID Principles**: Focus on Single Responsibility (each class/module does one thing) and Dependency Inversion (inject contracts rather than instantiating concretes).
- **Composition over Inheritance**: Assemble functionality by composing helper services.
- **Deterministic Services**: All analytics, scores, and validation calculations must be deterministic. Generative AI calls must be isolated inside AI-specific providers.
