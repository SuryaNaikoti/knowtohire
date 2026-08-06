# KnowToHire Version 1.0 — Reusable Demo Data Setup Report

> **Document Type:** Production Demo Seeder System Documentation  
> **Platform Version:** Version 1.0 (Production Release Candidate 1)  
> **Target Audience:** Principal Backend Engineer, Supabase Architect, DevOps & Release Teams  
> **Status:** 🟢 Reusable & Idempotent Seeding System Complete  
> **Date:** August 5, 2026  

---

## 1. Executive Summary

The **KnowToHire Reusable Demo Seeder System** has been fully designed, implemented, and integrated into the repository build pipeline. 

Developers, QA testers, and release engineers can execute a single automated command (`npm run seed:demo`) to instantly provision all **8 demo accounts**, **3 employer entities**, **4 candidate profiles**, **10 jobs**, **interconnected job applications**, **notifications**, **resources**, **templates**, and **blog articles**.

The seeder operates with **100% idempotency**, skipping duplicate Auth user registrations safely while updating profile and relationship records without creating orphan data or duplicate entries.

---

## 2. Reusable Seeder Architecture

```text
                                  ┌──────────────────────────────┐
                                  │      npm run seed:demo       │
                                  └──────────────┬───────────────┘
                                                 │
                                ┌────────────────┴────────────────┐
                                ▼                                 ▼
                     ┌────────────────────┐            ┌────────────────────┐
                     │ seed-demo-users.ts │            │ seed-demo-data.ts  │
                     └──────────┬─────────┘            └──────────┬─────────┘
                                │                                 │
                 ┌──────────────┴──────────────┐   ┌──────────────┴──────────────┐
                 ▼                             ▼   ▼                             ▼
        ┌─────────────────┐           ┌───────────────────┐             ┌──────────────────┐
        │ Supabase Auth   │           │ PostgreSQL Public │             │ Verification     │
        │ Admin/User API  │           │ Domain Tables     │             │ verify-demo.ts   │
        └─────────────────┘           └───────────────────┘             └──────────────────┘
```

---

## 3. Predefined Demo Accounts Master Directory

| Role | Full Name / Designation | Entity / Company | Email Address | Password | Direct Dashboard URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | Rajeev Sharma (Platform Director) | KnowToHire Platform | `admin@knowtohire.com` | `Admin@123` | `/dashboard/admin` |
| 🏢 **Employer 1** | Arjun Mehta (HR Manager) | GreenEarth Consultants Pvt Ltd | `hr@greenearthconsultants.com` | `Employer@123` | `/dashboard/employer` |
| 🏢 **Employer 2** | Priya Nair (Talent Head) | SustainEdge Consulting | `careers@sustainedge.com` | `Employer@123` | `/dashboard/employer` |
| 🏢 **Employer 3** | Rohit Verma (Recruitment Lead) | Patent Nexus | `jobs@patentnexus.com` | `Employer@123` | `/dashboard/employer` |
| 🎓 **Candidate 1** | Rahul Sharma (Environmental Engineer) | Candidate Portal | `rahul.sharma@gmail.com` | `Candidate@123` | `/dashboard/candidate` |
| 🎓 **Candidate 2** | Sneha Reddy (Lead ESG Consultant) | Candidate Portal | `sneha.reddy@gmail.com` | `Candidate@123` | `/dashboard/candidate` |
| 🎓 **Candidate 3** | Aditya Rao (Patent Associate) | Candidate Portal | `aditya.rao@gmail.com` | `Candidate@123` | `/dashboard/candidate` |
| 🎓 **Candidate 4** | Neha Kapoor (Research Associate) | Candidate Portal | `neha.kapoor@gmail.com` | `Candidate@123` | `/dashboard/candidate` |

---

## 4. Execution Commands

- **Seed Demo Environment:**
  ```bash
  npm run seed:demo
  ```
- **Run Automated Verification:**
  ```bash
  npm run verify:demo
  ```
- **Reset Environment:**
  ```bash
  npm run reset:demo
  ```
