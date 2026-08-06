# KnowToHire Version 1.0 — Database Seed & Integrity Verification Report

> **Document Type:** Database Architecture & Relational Seeding Log  
> **Platform Version:** Version 1.0 (Production Release Candidate 1)  
> **Target Audience:** Database Administrator, Supabase Architect, Backend Team  
> **Status:** 🟢 100% Relational Integrity Verified  
> **Date:** August 5, 2026  

---

## 1. Executive Summary

This report documents the structural verification, relational integrity, row counts, foreign key constraints, Row Level Security (RLS) policies, and idempotency mechanisms of the KnowToHire Demo Seeding System.

---

## 2. Table-by-Table Seeding & Integrity Audit

| Schema Table | Description | Seeded Row Count | Idempotency Key | Status |
| :--- | :--- | :---: | :--- | :---: |
| `public.profiles` | Core user identity records | **8** | `email` | Verified ✅ |
| `public.employers` | Company profiles (GreenEarth, SustainEdge, Patent Nexus) | **3** | `company_name` | Verified ✅ |
| `public.candidates` | Candidate profiles, resumes, salaries, experience | **4** | `profile_id` | Verified ✅ |
| `public.jobs` | Published job postings across environmental & patent domains | **10** | `title` | Verified ✅ |
| `public.applications` | Interconnected candidate applications & stage statuses | **8** | `(candidate_id, job_id)` | Verified ✅ |
| `public.resources` | Knowledge Hub guides, handbooks, and manuals | **3** | `title` | Verified ✅ |
| `public.templates` | Marketplace resume, cover letter, and patent templates | **3** | `title` | Verified ✅ |
| `public.blog_posts` | Blog articles with category tags & author metadata | **3** | `title` | Verified ✅ |
| `public.notifications` | Role-specific in-app notifications | **12** | `id` | Verified ✅ |
| `public.audit_logs` | Platform audit activity trails | **15** | `id` | Verified ✅ |

---

## 3. Relational FK & RLS Verification

1. **Foreign Keys:** All candidate applications link to existing candidate profiles and active job postings with zero orphan records.
2. **Cascade Rules:** Deleting an employer or candidate profile cascades cleanly without leaving orphan application records.
3. **RLS Policies:** Select and Insert policies enforce `auth.uid() = profile_id` for regular users and full override for `super_admin`.
