# KnowToHire – Development Workflow

> Last Updated: 2026-07-05  
> Repository: https://github.com/SuryaNaikoti/knowtohire

---

## 🌿 Branch Strategy

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Stable releases — production-ready code only | ✅ Active |
| `sprint5-candidate-portal` | Candidate Portal — profile, jobs, applications | 🚀 Active |
| `sprint5-employer-portal` | Employer Portal — job posting, team, analytics | ⏳ Pending |
| `sprint6-marketplace` | Marketplace & Monetization — credits, subscriptions | ⏳ Pending |
| `sprint7-production` | Production Stabilization — hardening, performance | ⏳ Pending |

### Branch Rules

- `main` is **protected** — only merge via Pull Request after review
- Each sprint branch is created **from** `main` at sprint start
- Merge back to `main` only when sprint is **fully tested and stable**
- Never commit directly to `main` after Sprint 5

---

## 🔄 Daily Workflow

### Start of Day — Pull Latest Changes

```bash
# On your sprint branch
git checkout sprint5-candidate-portal
git pull origin sprint5-candidate-portal
```

### During Development — Stage & Commit

```bash
# Check what changed
git status

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: add candidate profile completion flow"
```

### Commit Message Convention

```
feat:     New feature
fix:      Bug fix
refactor: Code improvement (no feature change)
style:    UI/styling only
docs:     Documentation update
chore:    Config, tooling, dependencies
test:     Tests
```

**Examples:**
```bash
git commit -m "feat: candidate skills badge selector with search"
git commit -m "fix: profile completion meter not updating on save"
git commit -m "refactor: extract JobCard into reusable component"
git commit -m "docs: update API integration notes"
```

### End of Day — Push Changes

```bash
git push origin sprint5-candidate-portal
```

---

## 🔀 Creating a New Sprint Branch

```bash
# Always branch from latest main
git checkout main
git pull origin main

# Create and push new branch
git checkout -b sprint5-employer-portal
git push -u origin sprint5-employer-portal
```

---

## 🔁 Merging a Sprint into Main (via PR)

```bash
# On GitHub: Create Pull Request from sprint branch → main
# After PR approval and merge:

git checkout main
git pull origin main

# Optionally delete the merged sprint branch
git branch -d sprint5-candidate-portal
git push origin --delete sprint5-candidate-portal
```

---

## 🏷️ Milestone Tagging

Tag every stable release on `main` after merging a sprint:

```bash
# Sprint 5 — Candidate Portal Complete
git tag -a v0.6-candidate-portal -m "Candidate Portal Complete"
git push --tags

# Sprint 5 — Employer Portal Complete
git tag -a v0.7-employer-portal -m "Employer Portal Complete"
git push --tags

# Sprint 6 — Marketplace Complete
git tag -a v0.8-marketplace -m "Marketplace and Monetization Complete"
git push --tags

# Sprint 7 — Production Launch
git tag -a v1.0-launch -m "KnowToHire Production Launch"
git push --tags
```

### Version Scheme

```
v0.5  → Database & Authentication (DONE)
v0.6  → Candidate Portal
v0.7  → Employer Portal
v0.8  → Marketplace
v1.0  → Production Launch
```

---

## 🚨 Emergency Hotfix Workflow

```bash
# Branch from main for urgent fixes
git checkout main
git pull origin main
git checkout -b hotfix/rls-policy-fix

# Make fix, commit, push
git add .
git commit -m "fix: resolve RLS recursion on profiles table"
git push -u origin hotfix/rls-policy-fix

# Create PR → merge → tag if needed
git tag -a v0.5.1-hotfix -m "RLS policy hotfix"
git push --tags
```

---

## 🔐 Security Rules

- **NEVER** commit `.env` or `.env.local` — contains Supabase keys
- **NEVER** commit `node_modules/` — use `npm install` to restore
- **NEVER** hardcode API keys, tokens, or passwords in source files
- Always use `.env.example` to document required environment variables

---

## 📋 Pre-Push Checklist

Before every `git push`:

- [ ] `git status` — confirm only intended files are staged
- [ ] No `.env` or secret files in staged list
- [ ] Commit message follows convention
- [ ] Code builds without errors (`npm run build`)
- [ ] No console errors in browser
