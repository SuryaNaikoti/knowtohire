import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAdmin() {
  console.log('--- Testing Admin Queries ---');
  // 1. Total Metrics
  const [usersCount, candCount, empCount, compCount, jobsCount, appsCount, resCount, tmplCount, blogCount, reqCount] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'candidate'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'employer'),
    supabase.from('company_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('templates').select('id', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
    supabase.from('resource_requests').select('id', { count: 'exact', head: true }),
  ]);

  console.log('Admin Metrics Aggregation:');
  console.log('  Total Users:', usersCount.count);
  console.log('  Candidates:', candCount.count);
  console.log('  Employers:', empCount.count);
  console.log('  Companies:', compCount.count);
  console.log('  Jobs:', jobsCount.count);
  console.log('  Applications:', appsCount.count);
  console.log('  Resources:', resCount.count);
  console.log('  Templates:', tmplCount.count);
  console.log('  Blog Posts:', blogCount.count);
  console.log('  Resource Requests:', reqCount.count);

  // 2. User Directory Query
  const { data: users, error: userErr } = await supabase.from('profiles').select('*').limit(5);
  console.log('\nUser Directory Query:', users?.length, 'users fetched. Error:', userErr);

  // 3. Company Verification Listing
  const { data: companies, error: compErr } = await supabase.from('company_profiles').select('*').limit(5);
  console.log('Company Profiles Query:', companies?.length, 'companies fetched. Error:', compErr);

  // 4. Content Requests Queue
  const { data: requests, error: reqErr } = await supabase.from('resource_requests').select('*').limit(5);
  console.log('Content Requests Queue:', requests?.length, 'requests fetched. Error:', reqErr);
}

testAdmin();
