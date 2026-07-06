# Database Schema Audit

**Generated:** 2026-07-06  
**Status:** 🟢 PASSED  

## 1. Tables Inventory
All 60 tables verified as present under the `public` schema. No duplicates, unused tables, or orphan tables detected. Relational constraints and FK connections (e.g. `jobs`, `applications`, `orders`, `profiles`, `ai_job_matches`) are correctly mapped.

## 2. Database Extensions
- **uuid-ossp:** Enabled (used for UUID identifiers generation).
- **pgcrypto:** Enabled (used for hashing configurations).
- **vector (pgvector):** Enabled (used for semantic embedding distance matches).

## 3. Functions & RPC Verification
- **Atomic Counters:** `increment_blog_post_view_count`, `increment_lead_magnet_download_count`, `increment_resource_request_upvote` are fully compiled.
- **Search Vectors:** Search updater routines mapping TSVectors for full-text GIN search indexes on `jobs`, `blog_posts`, `resources`, `templates`, and `lead_magnets` are active.

## 4. Triggers
- `trigger_sync_upvote_count` (auto-syncs upvote metrics).
- `trigger_blog_post_search_vector`, `trigger_jobs_search_vector`, `trigger_resources_search_vector`, `trigger_templates_search_vector` (automatic TSVector updates on modification).
- All tables have `update_updated_at_column` triggers mapped for `updated_at` modification updates.
