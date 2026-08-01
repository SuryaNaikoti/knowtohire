# Tenant Isolation Verification Matrix

This matrix documents where and how tenant boundaries are enforced across data access layers, services, and cloud storage buckets.

---

## 📊 Matrix Audit Table

| Entity / Object | Enforced Layer | Isolation Method | Security Level |
| :--- | :--- | :--- | :--- |
| **`public.companies` Table** | RLS / Database | Scopes access via user's `company_team_members` membership row. | **Highly Secure** |
| **`public.jobs` Table** | RLS / Database | Filters select/inserts matching employer's mapped company relation. | **Highly Secure** |
| **`public.applications` Table** | RLS / Database | Restricts select bounds to resource owner candidates or target recruiters. | **Highly Secure** |
| **`resumes` Bucket** | Storage Policy | Restricts download/write actions to folder structures matching user ID scopes. | **Highly Secure** |
| **`logos` Bucket** | Storage Policy | Grants write/delete access strictly to employer members with `'Admin'` role. | **Highly Secure** |
| **`candidateService`** | Service Layer | Resolves active workspace tenant subdomains internally using `tenantResolver`. | **Secure** |
| **`employerService`** | Service Layer | Scopes team additions and details edits to the active employer's company. | **Secure** |
