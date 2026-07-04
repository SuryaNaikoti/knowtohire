-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin', 'super_admin');

CREATE TYPE application_status AS ENUM (
  'draft', 'applied', 'reviewing', 'shortlisted', 
  'interview', 'offered', 'hired', 'rejected', 'withdrawn'
);

CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TYPE work_mode AS ENUM ('onsite', 'remote', 'hybrid');

CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');

CREATE TYPE notification_type AS ENUM ('application_update', 'job_alert', 'payment', 'system');

-- 2. Trigger Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. System Roles & Permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. User Profiles (Referencing auth.users)
-- auth schema and auth.users already exist in Supabase.
-- The following placeholder definitions were used only for local compilation
-- and should NOT be executed in the live Supabase project.

-- CREATE SCHEMA IF NOT EXISTS auth;

-- CREATE TABLE IF NOT EXISTS auth.users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   email VARCHAR(255) UNIQUE
-- );

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role DEFAULT 'candidate'::user_role NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  headline VARCHAR(255),
  resume_url TEXT,
  experience_years NUMERIC(4,2),
  bio TEXT,
  location VARCHAR(150),
  social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Normalized Candidate Resume Sub-tables
CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(50), -- e.g. beginner, intermediate, advanced
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_candidate_skill UNIQUE (candidate_id, skill_name)
);

CREATE TABLE candidate_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  role_title VARCHAR(255) NOT NULL,
  location VARCHAR(150),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  grade VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE candidate_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255) NOT NULL,
  issue_date DATE,
  expiration_date DATE,
  credential_id VARCHAR(100),
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE candidate_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_url TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Companies & Employer Profiles (Multi-Company Architecture)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(275) UNIQUE NOT NULL,
  website TEXT,
  logo_url TEXT,
  industry VARCHAR(100),
  size VARCHAR(50),
  description TEXT,
  headquarters VARCHAR(150),
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  job_title VARCHAR(150),
  billing_address JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  department VARCHAR(100),
  access_level INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Jobs Portal
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(275) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150) NOT NULL,
  work_mode work_mode DEFAULT 'onsite'::work_mode NOT NULL,
  job_type job_type DEFAULT 'full-time'::job_type NOT NULL,
  department VARCHAR(100) NOT NULL,
  salary_min NUMERIC(12,2),
  salary_max NUMERIC(12,2),
  salary_currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
  experience_min INT DEFAULT 0 NOT NULL,
  experience_max INT,
  requirements TEXT[] DEFAULT '{}'::text[] NOT NULL,
  benefits TEXT[] DEFAULT '{}'::text[] NOT NULL,
  match_score_criteria JSONB DEFAULT '{}'::jsonb NOT NULL,
  search_vector TSVECTOR,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_job_skill UNIQUE (job_id, skill_name)
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'applied'::application_status NOT NULL,
  resume_version_url TEXT,
  cover_letter TEXT,
  match_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
  status application_status NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE saved_jobs (
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (candidate_id, job_id)
);

CREATE TABLE job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  keywords VARCHAR(255),
  location VARCHAR(150),
  department VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. Knowledge Ecosystem
CREATE TABLE resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(275) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  format VARCHAR(50) NOT NULL, -- e.g. PDF, Valuation Model
  file_url TEXT NOT NULL,
  file_size VARCHAR(50),
  cover_url TEXT,
  rating NUMERIC(3,2) DEFAULT 0.00 NOT NULL,
  downloads_count INT DEFAULT 0 NOT NULL,
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE resource_category_items (
  category_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, resource_id)
);

CREATE TABLE resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(275) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  formats VARCHAR(20)[] DEFAULT '{}'::varchar[] NOT NULL,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 0.00 NOT NULL,
  downloads_count INT DEFAULT 0 NOT NULL,
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE template_category_items (
  category_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, template_id)
);

CREATE TABLE template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Blog CMS with Tags
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(275) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_url TEXT,
  read_time VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  search_vector TSVECTOR,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 7. Payments & Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status subscription_status DEFAULT 'trial'::subscription_status NOT NULL,
  plan_id VARCHAR(100) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  total_amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
  status payment_status DEFAULT 'pending'::payment_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  stripe_charge_id VARCHAR(255) UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  status payment_status DEFAULT 'pending'::payment_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Communication
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type DEFAULT 'system'::notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sla_hours INT DEFAULT 24 NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Triggers Setup for Auto-modifying Updated At
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_modtime BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_profiles_modtime BEFORE UPDATE ON candidate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_experience_modtime BEFORE UPDATE ON candidate_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_education_modtime BEFORE UPDATE ON candidate_education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_projects_modtime BEFORE UPDATE ON candidate_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employer_profiles_modtime BEFORE UPDATE ON employer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_profiles_modtime BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_modtime BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_modtime BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_alerts_modtime BEFORE UPDATE ON job_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_modtime BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_modtime BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_modtime BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_modtime BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_modtime BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_inquiries_modtime BEFORE UPDATE ON contact_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_subscribers_modtime BEFORE UPDATE ON newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-Text Search Auto-updating Triggers Functions
CREATE OR REPLACE FUNCTION candidate_profiles_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.headline, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.bio, '')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION companies_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION jobs_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION blog_posts_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.content, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate_candidate_profiles BEFORE INSERT OR UPDATE ON candidate_profiles FOR EACH ROW EXECUTE FUNCTION candidate_profiles_search_trigger();
CREATE TRIGGER tsvectorupdate_companies BEFORE INSERT OR UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION companies_search_trigger();
CREATE TRIGGER tsvectorupdate_jobs BEFORE INSERT OR UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION jobs_search_trigger();
CREATE TRIGGER tsvectorupdate_blog_posts BEFORE INSERT OR UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION blog_posts_search_trigger();

-- 10. Performance Indexes Recommendations
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX idx_candidate_experience_candidate_id ON candidate_experience(candidate_id);
CREATE INDEX idx_candidate_education_candidate_id ON candidate_education(candidate_id);
CREATE INDEX idx_employer_profiles_company_id ON employer_profiles(company_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

-- GIN Indexes for Full-Text Search
CREATE INDEX idx_candidate_profiles_search ON candidate_profiles USING gin(search_vector);
CREATE INDEX idx_companies_search ON companies USING gin(search_vector);
CREATE INDEX idx_jobs_search ON jobs USING gin(search_vector);
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(search_vector);
