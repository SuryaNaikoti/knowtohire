import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectJob() {
  const targetJobId = '84215ee4-886e-4f56-9b01-f2d5c69bb5e6';
  console.log('='.repeat(70));
  console.log(`INSPECTING JOB ${targetJobId}`);
  console.log('='.repeat(70));

  // 1. Direct select with anon client (no join)
  console.log('\n1. Direct SELECT on jobs (anon, no join)...');
  const { data: rawJob, error: rawErr } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', targetJobId);

  console.log('  Result count:', rawJob?.length);
  console.log('  Job row:', rawJob?.[0]);
  console.log('  Error:', rawErr);

  // 2. Select with company join (anon)
  console.log('\n2. SELECT on jobs with company_profiles join (anon)...');
  const { data: joinedJob, error: joinErr } = await supabase
    .from('jobs')
    .select('*, company:company_profiles(*)')
    .eq('id', targetJobId)
    .eq('status', 'published')
    .maybeSingle();

  console.log('  Result:', joinedJob);
  console.log('  Error:', joinErr);

  // 3. Search jobs query (the working job-list query)
  console.log('\n3. Running searchJobs query (the working job list query)...');
  const { data: searchJobsList, error: searchErr } = await supabase
    .from('jobs')
    .select('*, company:company_profiles(*)', { count: 'exact' })
    .eq('status', 'published');

  console.log('  Total published jobs found in search list:', searchJobsList?.length);
  console.log('  Published job IDs in list:', searchJobsList?.map(j => ({ id: j.id, title: j.title, status: j.status, company: j.company?.name })));

  // 4. Check if 84215ee4-886e-4f56-9b01-f2d5c69bb5e6 is in the search list
  const foundInList = searchJobsList?.find(j => j.id === targetJobId);
  console.log(`\n4. Is target job ${targetJobId} in searchJobsList?`, Boolean(foundInList));
  if (foundInList) {
    console.log('  Found job data:', foundInList);
  }
}

inspectJob();
