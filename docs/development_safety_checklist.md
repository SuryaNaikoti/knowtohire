# KnowToHire – Development Safety Checklist

> A mandatory checklist to follow before every push and after every stable milestone.  
> Following this consistently prevents broken builds, secret leaks, and data loss.

---

## 🚀 Before Every Push

Run through this checklist **every time** before executing `git push`:

### Step 1 – Verify Build Passes

```bash
npm run build
```

**Expected output:**
```
✓ built in X.Xs
```

If the build fails — **do not push**. Fix TypeScript errors and component issues first.

---

### Step 2 – Check What Will Be Committed

```bash
git status
```

Review the output carefully:

- ✅ Only files you intentionally changed should appear
- ❌ `.env` or `.env.local` must **never** appear in staged files
- ❌ `node_modules/` must **never** appear
- ❌ `dist/` must **never** appear

If any sensitive file appears:

```bash
# Remove it from staging immediately
git restore --staged .env
git restore --staged .env.local
```

---

### Step 3 – Stage Changes

```bash
git add .
```

Or stage selectively:

```bash
git add src/pages/dashboard/candidate/
git add src/lib/services/candidateService.ts
```

---

### Step 4 – Commit with a Meaningful Message

```bash
git commit -m "feat: candidate skills badge selector with search and proficiency"
```

**Commit message format:**

```
<type>: <short description>

Types:
  feat      → New feature
  fix       → Bug fix
  refactor  → Code improvement
  style     → UI/CSS only
  docs      → Documentation
  chore     → Config, deps, tooling
  test      → Tests
```

**Good examples:**
```bash
git commit -m "feat: resume upload with Supabase Storage and progress indicator"
git commit -m "fix: profile completion meter not recalculating on skill add"
git commit -m "refactor: extract CandidateProfileHeader into reusable component"
git commit -m "docs: update sprint5 kickoff with notification center scope"
```

---

### Step 5 – Push

```bash
git push origin sprint5-candidate-portal
# or
git push origin main
```

Confirm the push succeeded — GitHub should report the branch and commit hash.

---

## 🏷️ After Every Stable Milestone

Run this sequence when a sprint or significant feature set is complete and merged to `main`:

### Step 1 – Ensure You Are on Main and Up to Date

```bash
git checkout main
git pull origin main
```

### Step 2 – Create an Annotated Tag

```bash
# Candidate Portal complete
git tag -a v0.6-candidate-portal -m "Candidate Portal Complete – Sprint 5"

# Employer Portal complete
git tag -a v0.7-employer-portal -m "Employer Portal Complete – Sprint 5"

# Marketplace complete
git tag -a v0.8-marketplace -m "Marketplace and Monetization Complete – Sprint 6"

# Production launch
git tag -a v1.0-launch -m "KnowToHire Production Launch – Sprint 7"
```

### Step 3 – Push Tags to GitHub

```bash
git push --tags
```

Verify the tag appears at:  
`https://github.com/SuryaNaikoti/knowtohire/tags`

---

## 🔐 Security Non-Negotiables

| Rule | Action |
|------|--------|
| Never commit `.env` | Verify with `git status` before every push |
| Never commit `.env.local` | Both are in `.gitignore` — double-check |
| Never hardcode API keys | Use `import.meta.env.VITE_*` variables |
| Never commit `node_modules` | Run `npm install` to restore |
| Use `.env.example` only | Template file with placeholder values only |

---

## 🩺 Emergency: Accidentally Committed a Secret

If you accidentally commit a secret key:

```bash
# Step 1: Remove from latest commit (if not yet pushed)
git reset --soft HEAD~1
git restore --staged .env
git commit -m "chore: remove accidentally staged env file"

# Step 2: If already pushed — immediately rotate the key in Supabase dashboard
# Then remove from history (advanced):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

> [!WARNING]
> If a Supabase `anon` or `service_role` key is exposed, **rotate it immediately** in the Supabase Dashboard under Project Settings → API. The old key will stop working instantly.

---

## 📋 Quick Reference Card

```
BEFORE EVERY PUSH:
  1. npm run build          ← Must pass with zero errors
  2. git status             ← No .env, no node_modules, no dist
  3. git add .              ← Stage only what you intend
  4. git commit -m "..."    ← Use feat/fix/docs/refactor prefix
  5. git push               ← Push to your current branch

AFTER EVERY MILESTONE:
  1. git checkout main
  2. git pull origin main
  3. git tag -a vX.X-name -m "description"
  4. git push --tags
```

---

## 🏁 Branch & Environment Reference

| Branch | Purpose | Push Target |
|--------|---------|-------------|
| `main` | Stable releases | After PR merge only |
| `sprint5-candidate-portal` | Candidate Portal work | Daily pushes |
| `sprint5-employer-portal` | Employer Portal work | Daily pushes |
| `sprint6-marketplace` | Marketplace | Future |
| `sprint7-production` | Production hardening | Future |

| Variable | File | Gitignored? |
|----------|------|-------------|
| `VITE_SUPABASE_URL` | `.env.local` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | ✅ Yes |
| Example template | `.env.example` | ❌ Committed |
