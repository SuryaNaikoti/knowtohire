# System Architecture

## Overview
KnowToHire is structured as a modular monolithic single-page application built on React, TypeScript, and Supabase. The system is designed to evolve into a multi-tenant enterprise job-matching and career intelligence platform.

```
+-------------------------------------------------------------+
|                     Presentation Layer                      |
|  - Candidate Dashboard Widgets                              |
|  - Profile & Onboarding Forms                               |
+-------------------------------------------------------------+
                              ↓
+-------------------------------------------------------------+
|                      Application Layer                      |
|  - ValidationService & Orchestration                        |
|  - ProfileCompletionService                                 |
|  - CareerIntelligenceService                                |
+-------------------------------------------------------------+
                              ↓
+-------------------------------------------------------------+
|                     Infrastructure Layer                    |
|  - SupabaseRepository<T>                                    |
|  - AIProvider Interface & Providers                         |
+-------------------------------------------------------------+
```

## System Tenancy & RLS Boundaries
All user and candidate details are isolated by Row Level Security (RLS) policies targeting `auth.uid() = candidate_id` or tenant identifiers. Cross-tenant access is filtered at the database level.
