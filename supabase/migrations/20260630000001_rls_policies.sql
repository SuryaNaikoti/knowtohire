-- RLS Policies for KnowToHire v1.0

-- 1. Helper functions to decode JWT metadata role and id
CREATE OR REPLACE FUNCTION get_jwt_role()
RETURNS VARCHAR AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role')::VARCHAR,
    'candidate'::VARCHAR
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_jwt_role() IN ('admin', 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_category_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_category_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy Definitions

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CANDIDATE SUB-PROFILES
DROP POLICY IF EXISTS "Candidate profiles are viewable by owner or employers/admins" ON candidate_profiles;
CREATE POLICY "Candidate profiles are viewable by owner or employers/admins"
ON candidate_profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  get_jwt_role() IN ('employer', 'admin', 'super_admin')
);

DROP POLICY IF EXISTS "Candidates can modify their own profile data" ON candidate_profiles;
CREATE POLICY "Candidates can modify their own profile data"
ON candidate_profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CANDIDATE DATA MODULES (Skills, Experience, Education, Projects, Certs)
DROP POLICY IF EXISTS "Candidate details are viewable by owner or employers/admins" ON candidate_skills;
CREATE POLICY "Candidate details are viewable by owner or employers/admins"
ON candidate_skills FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR get_jwt_role() IN ('employer', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Candidates can modify their own skills details" ON candidate_skills;
CREATE POLICY "Candidates can modify their own skills details"
ON candidate_skills FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidate experience is viewable by owner or employers/admins" ON candidate_experience;
CREATE POLICY "Candidate experience is viewable by owner or employers/admins"
ON candidate_experience FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR get_jwt_role() IN ('employer', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Candidates can modify their own experience logs" ON candidate_experience;
CREATE POLICY "Candidates can modify their own experience logs"
ON candidate_experience FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidate education is viewable by owner or employers/admins" ON candidate_education;
CREATE POLICY "Candidate education is viewable by owner or employers/admins"
ON candidate_education FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR get_jwt_role() IN ('employer', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Candidates can modify their own education records" ON candidate_education;
CREATE POLICY "Candidates can modify their own education records"
ON candidate_education FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidate certifications are viewable by owner or employers/admins" ON candidate_certifications;
CREATE POLICY "Candidate certifications are viewable by owner or employers/admins"
ON candidate_certifications FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR get_jwt_role() IN ('employer', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Candidates can modify their own certifications" ON candidate_certifications;
CREATE POLICY "Candidates can modify their own certifications"
ON candidate_certifications FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidate projects are viewable by owner or employers/admins" ON candidate_projects;
CREATE POLICY "Candidate projects are viewable by owner or employers/admins"
ON candidate_projects FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR get_jwt_role() IN ('employer', 'admin', 'super_admin'));

DROP POLICY IF EXISTS "Candidates can modify their own projects" ON candidate_projects;
CREATE POLICY "Candidates can modify their own projects"
ON candidate_projects FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

-- COMPANIES
DROP POLICY IF EXISTS "Companies list is viewable by everyone" ON companies;
CREATE POLICY "Companies list is viewable by everyone"
ON companies FOR SELECT
TO authenticated, anon
USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Company admins or platform admins can update company details" ON companies;
CREATE POLICY "Company admins or platform admins can update company details"
ON companies FOR ALL
TO authenticated
USING (
  check_is_admin() OR 
  EXISTS (
    SELECT 1 FROM employer_profiles 
    WHERE employer_profiles.id = auth.uid() AND employer_profiles.company_id = companies.id
  )
)
WITH CHECK (
  check_is_admin() OR 
  EXISTS (
    SELECT 1 FROM employer_profiles 
    WHERE employer_profiles.id = auth.uid() AND employer_profiles.company_id = companies.id
  )
);

-- EMPLOYER PROFILES
DROP POLICY IF EXISTS "Employer profiles are viewable by authenticated users" ON employer_profiles;
CREATE POLICY "Employer profiles are viewable by authenticated users"
ON employer_profiles FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Employers can update their own data profile" ON employer_profiles;
CREATE POLICY "Employers can update their own data profile"
ON employer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ADMIN PROFILES
DROP POLICY IF EXISTS "Admin profiles are only accessible by admins" ON admin_profiles;
CREATE POLICY "Admin profiles are only accessible by admins"
ON admin_profiles FOR ALL
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- JOBS
DROP POLICY IF EXISTS "Active jobs are viewable by everyone" ON jobs;
CREATE POLICY "Active jobs are viewable by everyone"
ON jobs FOR SELECT
USING (is_active = TRUE AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Employers can manage jobs linked to their company" ON jobs;
CREATE POLICY "Employers can manage jobs linked to their company"
ON jobs FOR ALL
TO authenticated
USING (
  check_is_admin() OR
  (
    get_jwt_role() = 'employer' AND
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE employer_profiles.id = auth.uid() AND employer_profiles.company_id = jobs.company_id
    )
  )
)
WITH CHECK (
  check_is_admin() OR
  (
    get_jwt_role() = 'employer' AND
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE employer_profiles.id = auth.uid() AND employer_profiles.company_id = jobs.company_id
    )
  )
);

-- JOB SKILLS
DROP POLICY IF EXISTS "Job skills require same access levels as jobs" ON job_skills;
CREATE POLICY "Job skills require same access levels as jobs"
ON job_skills FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Employers can modify job skills requirements" ON job_skills;
CREATE POLICY "Employers can modify job skills requirements"
ON job_skills FOR ALL TO authenticated USING (
  check_is_admin() OR
  EXISTS (
    SELECT 1 FROM jobs 
    JOIN employer_profiles ON employer_profiles.company_id = jobs.company_id
    WHERE jobs.id = job_skills.job_id AND employer_profiles.id = auth.uid()
  )
)
WITH CHECK (
  check_is_admin() OR
  EXISTS (
    SELECT 1 FROM jobs 
    JOIN employer_profiles ON employer_profiles.company_id = jobs.company_id
    WHERE jobs.id = job_skills.job_id AND employer_profiles.id = auth.uid()
  )
);

-- JOB APPLICATIONS
DROP POLICY IF EXISTS "Job applications are viewable by owner or job posters" ON job_applications;
CREATE POLICY "Job applications are viewable by owner or job posters"
ON job_applications FOR SELECT
TO authenticated
USING (
  check_is_admin() OR
  candidate_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM jobs
    JOIN employer_profiles ON employer_profiles.company_id = jobs.company_id
    WHERE jobs.id = job_applications.job_id AND employer_profiles.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can apply to jobs" ON job_applications;
CREATE POLICY "Candidates can apply to jobs"
ON job_applications FOR INSERT
TO authenticated
WITH CHECK (
  get_jwt_role() = 'candidate' AND
  candidate_id = auth.uid()
);

DROP POLICY IF EXISTS "Employers or admins can update application statuses" ON job_applications;
CREATE POLICY "Employers or admins can update application statuses"
ON job_applications FOR UPDATE
TO authenticated
USING (
  check_is_admin() OR
  EXISTS (
    SELECT 1 FROM jobs
    JOIN employer_profiles ON employer_profiles.company_id = jobs.company_id
    WHERE jobs.id = job_applications.job_id AND employer_profiles.id = auth.uid()
  )
);

-- APPLICATION STATUS HISTORY
DROP POLICY IF EXISTS "Applications history is visible to application readers" ON application_status_history;
CREATE POLICY "Applications history is visible to application readers"
ON application_status_history FOR SELECT
TO authenticated
USING (
  check_is_admin() OR
  EXISTS (
    SELECT 1 FROM job_applications
    WHERE job_applications.id = application_status_history.application_id AND 
    (job_applications.candidate_id = auth.uid() OR EXISTS (
      SELECT 1 FROM jobs JOIN employer_profiles ON employer_profiles.company_id = jobs.company_id
      WHERE jobs.id = job_applications.job_id AND employer_profiles.id = auth.uid()
    ))
  )
);

DROP POLICY IF EXISTS "Status changes can be posted by application editors" ON application_status_history;
CREATE POLICY "Status changes can be posted by application editors"
ON application_status_history FOR INSERT
TO authenticated
WITH CHECK (
  changed_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM job_applications
    WHERE job_applications.id = application_status_history.application_id AND 
    (check_is_admin() OR EXISTS (
      SELECT 1 FROM jobs JOIN employer_profiles ON employer_profiles.company_id = jobs.company_id
      WHERE jobs.id = job_applications.job_id AND employer_profiles.id = auth.uid()
    ))
  )
);

-- SAVED JOBS & ALERTS
DROP POLICY IF EXISTS "Saved jobs are private to candidates" ON saved_jobs;
CREATE POLICY "Saved jobs are private to candidates"
ON saved_jobs FOR ALL TO authenticated 
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Job alerts are private to candidates" ON job_alerts;
CREATE POLICY "Job alerts are private to candidates"
ON job_alerts FOR ALL TO authenticated 
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());

-- RESOURCES & CATEGORIES
DROP POLICY IF EXISTS "Resources are readable by everyone" ON resources;
CREATE POLICY "Resources are readable by everyone"
ON resources FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Resources can be modified only by admins" ON resources;
CREATE POLICY "Resources can be modified only by admins"
ON resources FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Resource downloads logs are private to owner or admins" ON resource_downloads;
CREATE POLICY "Resource downloads logs are private to owner or admins"
ON resource_downloads FOR ALL TO authenticated 
USING (user_id = auth.uid() OR check_is_admin())
WITH CHECK (user_id = auth.uid() OR check_is_admin());

-- TEMPLATES & MARKETPLACE
DROP POLICY IF EXISTS "Templates are readable by everyone" ON templates;
CREATE POLICY "Templates are readable by everyone"
ON templates FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Templates can be modified only by creators or admins" ON templates;
CREATE POLICY "Templates can be modified only by creators or admins"
ON templates FOR ALL TO authenticated 
USING (creator_id = auth.uid() OR check_is_admin())
WITH CHECK (creator_id = auth.uid() OR check_is_admin());

DROP POLICY IF EXISTS "Template purchases details are viewable by buyer or admins" ON template_purchases;
CREATE POLICY "Template purchases details are viewable by buyer or admins"
ON template_purchases FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR check_is_admin());

-- CATEGORIES LINKS (ReadOnly for public, write for Admin)
DROP POLICY IF EXISTS "Resource categories read is public" ON resource_categories;
CREATE POLICY "Resource categories read is public" ON resource_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Resource categories write is admin" ON resource_categories;
CREATE POLICY "Resource categories write is admin" ON resource_categories FOR ALL 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Resource items read is public" ON resource_category_items;
CREATE POLICY "Resource items read is public" ON resource_category_items FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Resource items write is admin" ON resource_category_items;
CREATE POLICY "Resource items write is admin" ON resource_category_items FOR ALL 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Template categories read is public" ON template_categories;
CREATE POLICY "Template categories read is public" ON template_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Template categories write is admin" ON template_categories;
CREATE POLICY "Template categories write is admin" ON template_categories FOR ALL 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Template items read is public" ON template_category_items;
CREATE POLICY "Template items read is public" ON template_category_items FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Template items write is admin" ON template_category_items;
CREATE POLICY "Template items write is admin" ON template_category_items FOR ALL 
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- BLOG CMS
DROP POLICY IF EXISTS "Blog posts read is public" ON blog_posts;
CREATE POLICY "Blog posts read is public" ON blog_posts FOR SELECT USING (published_at <= NOW() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Blog posts write is admin" ON blog_posts;
CREATE POLICY "Blog posts write is admin" ON blog_posts FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Blog categories read is public" ON blog_categories;
CREATE POLICY "Blog categories read is public" ON blog_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Blog categories write is admin" ON blog_categories;
CREATE POLICY "Blog categories write is admin" ON blog_categories FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Blog tags read is public" ON blog_tags;
CREATE POLICY "Blog tags read is public" ON blog_tags FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Blog tags write is admin" ON blog_tags;
CREATE POLICY "Blog tags write is admin" ON blog_tags FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- PAYMENTS, ORDERS & SUBSCRIPTIONS
DROP POLICY IF EXISTS "Subscriptions details are private to owner or admins" ON subscriptions;
CREATE POLICY "Subscriptions details are private to owner or admins"
ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR check_is_admin());

DROP POLICY IF EXISTS "Subscriptions write requires admin privileges" ON subscriptions;
CREATE POLICY "Subscriptions write requires admin privileges"
ON subscriptions FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Orders are private to owner or admins" ON orders;
CREATE POLICY "Orders are private to owner or admins"
ON orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR check_is_admin());

DROP POLICY IF EXISTS "Orders write requires admin privileges" ON orders;
CREATE POLICY "Orders write requires admin privileges"
ON orders FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Payments details are private to owner or admins" ON payments;
CREATE POLICY "Payments details are private to owner or admins"
ON payments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = payments.order_id AND (orders.user_id = auth.uid() OR check_is_admin())
  )
);

-- NOTIFICATIONS & LOGS
DROP POLICY IF EXISTS "Notifications are private to owner" ON notifications;
CREATE POLICY "Notifications are private to owner"
ON notifications FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Activity logs are only readable by admins" ON activity_logs;
CREATE POLICY "Activity logs are only readable by admins"
ON activity_logs FOR SELECT TO authenticated USING (check_is_admin());

DROP POLICY IF EXISTS "Activity logs can be appended by system actions" ON activity_logs;
CREATE POLICY "Activity logs can be appended by system actions"
ON activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- INQUIRIES & NEWSLETTER
DROP POLICY IF EXISTS "Contact inquiries can be inserted by anyone" ON contact_inquiries;
CREATE POLICY "Contact inquiries can be inserted by anyone"
ON contact_inquiries FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Contact inquiries can be viewed/modified only by admins" ON contact_inquiries;
CREATE POLICY "Contact inquiries can be viewed/modified only by admins"
ON contact_inquiries FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Newsletter subscription can be checked/inserted by anyone" ON newsletter_subscribers;
CREATE POLICY "Newsletter subscription can be checked/inserted by anyone"
ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Newsletter subscribers are manageable by admins" ON newsletter_subscribers;
CREATE POLICY "Newsletter subscribers are manageable by admins"
ON newsletter_subscribers FOR ALL TO authenticated 
USING (check_is_admin())
WITH CHECK (check_is_admin());
