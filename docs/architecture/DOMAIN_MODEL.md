# Domain Model Strategy

## Overview
To prevent database changes from impacting user-facing views, we decouple database entities (Persistence Models) from UI models (Domain Models) using a clean mapping layer.

```
+-------------------+      +------------------+      +----------------+
| Persistence Model |  ➜   |    Mapper Layer  |  ➜   |  Domain Model  |
| (Database Record) |      | (Convert schema) |      |   (UI Safe)    |
+-------------------+      +------------------+      +----------------+
```

### Mapping Rules
1. **No direct UI leak**: UI widgets must never consume raw table rows.
2. **Safe Fallbacks**: Mappers must provide logical fallback values (e.g. empty arrays or defaults) for missing database properties.
3. **Immutability**: Domain models are read-only in the UI, updated only through services.
