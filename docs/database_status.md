# KnowToHire — Database Schema & Status Report

## Live PostgreSQL Tables & Column Mappings

### 1. `profiles`
- `id` (uuid, PK, references `auth.users`)
- `role` ('candidate' | 'employer' | 'admin')
- `email` (text)
- `full_name` (text)
- `phone` (text)
- `status` ('active' | 'suspended' | 'pending_verification')
- `created_at`, `updated_at`

### 2. `candidate_profiles`
- `id` (uuid, PK)
- `profile_id` (uuid, references `profiles.id`)
- `headline` (text)
- `bio` (text)
- `location` (text)
- `domain_specialization` (text)
- `skills` (text[])
- `experience_years` (integer)
- `expected_salary_inr` (numeric)
- `notice_period_days` (integer)
- `resume_url` (text)
- `education`, `experience`, `certifications` (jsonb)
- `profile_completion` (integer)

### 3. `company_profiles`
- `id` (uuid, PK)
- `name` (text)
- `industry` (text)
- `headquarters_location` (text)
- `company_size` (text)
- `website_url` (text)
- `about` (text)
- `verification_status` ('pending_review' | 'verified' | 'rejected')

### 4. `employer_profiles`
- `id` (uuid, PK)
- `profile_id` (uuid, references `profiles.id`)
- `company_id` (uuid, references `company_profiles.id`)
- `job_title` (text)
- `work_phone` (text)

### 5. `jobs`
- `id` (uuid, PK)
- `company_id` (uuid, references `company_profiles.id`)
- `employer_id` (uuid, references `profiles.id`)
- `title` (text)
- `category` (text)
- `department` (text)
- `location` (text)
- `work_mode` ('onsite' | 'hybrid' | 'remote')
- `employment_type` ('full_time' | 'part_time' | 'contract' | 'internship')
- `min_salary_inr`, `max_salary_inr` (numeric)
- `skills` (text[])
- `description`, `requirements`, `benefits` (text)
- `status` ('draft' | 'published' | 'paused' | 'closed')
- `created_at`, `published_at`

### 6. `job_applications`
- `id` (uuid, PK)
- `job_id` (uuid, references `jobs.id`)
- `candidate_id` (uuid, references `profiles.id`)
- `company_id` (uuid, references `company_profiles.id`)
- `status` ('applied' | 'in_review' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn')
- `stage` ('new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn')
- `cover_letter` (text)
- `resume_url` (text)
- `candidate_snapshot` (jsonb)
- `created_at`, `updated_at`

### 7. `saved_jobs`
- `id` (uuid, PK)
- `candidate_id` (uuid, references `profiles.id`)
- `job_id` (uuid, references `jobs.id`)
- `created_at` (timestamptz)

### 8. `saved_candidates`
- `id` (uuid, PK)
- `employer_id` (uuid, references `profiles.id`)
- `candidate_id` (uuid, references `profiles.id`)
- `notes` (text)
- `created_at` (timestamptz)

### 9. `interviews`
- `id` (uuid, PK)
- `application_id` (uuid, references `job_applications.id`)
- `job_id` (uuid, references `jobs.id`)
- `candidate_id` (uuid, references `profiles.id`)
- `company_id` (uuid, references `company_profiles.id`)
- `title` (text)
- `interview_type` (text)
- `scheduled_at` (timestamptz)
- `duration_minutes` (integer)
- `meeting_link` (text)
- `status` ('scheduled' | 'completed' | 'cancelled' | 'rescheduled')

### 10. `resources` & `resource_downloads`
- `id`, `title`, `slug`, `description`, `format`, `file_url`, `rating`, `downloads_count`

### 11. `templates`
- `id`, `creator_id`, `title`, `slug`, `description`, `price_inr`, `formats`, `downloads_count`, `is_active`

### 12. `blog_posts`
- `id`, `author_id`, `title`, `slug`, `excerpt`, `content`, `cover_url`, `read_time`, `is_featured`, `view_count`, `published_at`

### 13. `resource_requests`
- `id`, `user_id`, `title`, `description`, `category`, `type`, `status` ('pending' | 'under_review' | 'completed' | 'rejected'), `admin_notes`, `completed_resource_id`

### 14. `notifications`
- `id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`

### 15. `orders` & `payments`
- `id`, `user_id`, `total_amount`, `status` ('pending' | 'completed' | 'failed'), `created_at`
