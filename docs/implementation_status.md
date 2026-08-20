# KnowToHire — Implementation Status Breakdown

## Service Layer Implementation Summary

All service abstractions in `src/services/` are fully connected to live Supabase tables with error handling and typing.

### 1. `knowledgeService.ts`
- `getResources(filters)`: Queries `resources` table with keyword search, category, format, sorting, and pagination.
- `getResourceBySlug(slugOrId)`: Retrieves full resource details.
- `trackDownload(resourceId)`: Records download in `resource_downloads` and increments `downloads_count`.
- `createResource()`, `updateResource()`, `deleteResource()`: Admin CMS operations.

### 2. `templateService.ts`
- `getTemplates(filters)`: Queries `templates` table with filters for category, price (free/paid), format, and sorting.
- `getTemplateBySlug(slugOrId)`: Retrieves template details.
- `trackDownload(templateId)`: Tracks download count.
- `createTemplate()`, `updateTemplate()`, `deleteTemplate()`: Admin marketplace operations.

### 3. `blogService.ts`
- `getBlogPosts(filters)`: Queries `blog_posts` table with search, category filtering, and featured post identification.
- `getBlogPostBySlug(slugOrId)`: Retrieves full article markdown content and automatically increments `view_count`.
- `createBlogPost()`, `updateBlogPost()`, `deleteBlogPost()`: Editorial CMS operations.

### 4. `notificationService.ts`
- `getMyNotifications()`: Fetches in-app notifications for authenticated candidate or recruiter.
- `getUnreadCount()`: Light query for notification bell counters.
- `markAsRead(id)`: Marks specific notification as read.
- `markAllAsRead()`: Bulk marks all notifications for authenticated user as read.
- `createNotification()`: Triggers system alerts for status changes or application updates.

### 5. `requestService.ts`
- `getMyRequests()`: Queries `resource_requests` for authenticated user.
- `getAllRequests()`: Admin query for review queue.
- `createRequest(input)`: Submits new on-demand content request.
- `updateRequestStatus(id, status, notes, resourceId)`: Admin review and deliverable association.

### 6. `paymentService.ts`
- `initiateCheckout(options)`: Inserts new record in `orders` table, configures Razorpay checkout modal with INR amounts and fallback simulation for sandbox testing.

### 7. `adminService.ts`
- `getAdminDashboardMetrics()`: Live parallel count queries across 10 tables.
- `getUsers(searchTerm, role)`: Queries `profiles` table with filtering.
- `updateUserStatus(userId, status)`: Suspends or activates user accounts.
- `getCompanies()`: Queries `company_profiles` for verification reviews.
- `updateCompanyVerification(id, status)`: Verifies or rejects employer enterprises.
- `getJobs()`: Moderates corporate job postings.
- `updateJobStatus(jobId, status)`: Pauses, publishes, or archives job postings.

### 8. `candidateDiscoveryService.ts`
- `searchCandidates(filters)`: Queries `candidate_profiles` joined with `profiles` for employer talent search.
- `getCandidateById(id)`: Full candidate profile view for recruiters.

---

## Page-by-Page Integration Matrix

| Page Path | Component | Data Source |
| :--- | :--- | :--- |
| `/` | `HomePage` | Live featured jobs, resources, templates, articles |
| `/jobs` | `JobsPage` | Live `jobService.getPublishedJobs()` |
| `/jobs/:id` | `JobDetailsPage` | Live `jobService.getJobById()` |
| `/careers` | `CareersPage` | 12 Green Verticals linking to filtered queries |
| `/knowledge` | `KnowledgePage` | Live `knowledgeService.getResources()` |
| `/knowledge/:id` | `ResourceDetailsPage` | Live `knowledgeService.getResourceBySlug()` |
| `/templates` | `TemplatesPage` | Live `templateService.getTemplates()` |
| `/templates/:id` | `TemplateDetailsPage` | Live `templateService.getTemplateBySlug()` |
| `/blog` | `BlogPage` | Live `blogService.getBlogPosts()` |
| `/blog/:slug` | `BlogDetailsPage` | Live `blogService.getBlogPostBySlug()` |
| `/pricing` | `PricingPage` | Live `paymentService.initiateCheckout()` |
| `/candidate` | `CandidateDashboardPage` | Live applications, saved jobs, interviews |
| `/candidate/applications` | `CandidateApplicationsPage` | Live `applicationService.getMyApplications()` |
| `/candidate/saved-jobs` | `CandidateSavedJobsPage` | Live `savedJobService.getMySavedJobs()` |
| `/candidate/interviews` | `CandidateInterviewsPage` | Live `interviewService.getMyInterviews()` |
| `/candidate/career-insights` | `CandidateCareerInsightsPage`| Live deterministic skill matching algorithm |
| `/candidate/requests` | `CandidateRequestsPage` | Live `requestService.getMyRequests()` |
| `/candidate/notifications` | `CandidateNotificationsPage` | Live `notificationService.getMyNotifications()` |
| `/employer` | `EmployerDashboardPage` | Live jobs, applications, interview metrics |
| `/employer/jobs` | `EmployerJobsPage` | Live `jobService.getEmployerJobs()` |
| `/employer/candidates` | `EmployerCandidatesPage` | Live `candidateDiscoveryService.searchCandidates()` |
| `/employer/candidates/compare` | `EmployerCandidateComparePage`| Live side-by-side comparison matrix |
| `/employer/pipeline` | `EmployerPipelinePage` | Live `applicationService.getCompanyApplications()` |
| `/employer/interviews` | `EmployerInterviewsPage` | Live `interviewService.getCompanyInterviews()` |
| `/employer/saved-candidates` | `EmployerSavedCandidatesPage`| Live `savedCandidateService.getMySavedCandidates()` |
| `/employer/company-profile` | `EmployerCompanyProfilePage` | Live `company_profiles` updates |
| `/employer/settings` | `EmployerSettingsPage` | Live `profiles` updates & auth logout |
| `/admin` | `AdminDashboardPage` | Live `adminService.getAdminDashboardMetrics()` |
| `/admin/users` | `AdminUsersPage` | Live `adminService.getUsers()` |
| `/admin/employers` | `AdminEmployersPage` | Live `adminService.getCompanies()` |
| `/admin/jobs` | `AdminJobsPage` | Live `adminService.getJobs()` |
| `/admin/resources` | `AdminResourcesPage` | Live `knowledgeService` CRUD |
| `/admin/templates` | `AdminTemplatesPage` | Live `templateService` CRUD |
| `/admin/requests` | `AdminRequestsPage` | Live `requestService` review queue |
| `/admin/blog` | `AdminBlogPage` | Live `blogService` editorial CMS |
