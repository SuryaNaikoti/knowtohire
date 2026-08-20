import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect() {
  // Login as employer to query
  await supabase.auth.signInWithPassword({
    email: 'cilove3743@hutdot.com',
    password: 'Password123!',
  });

  console.log('--- Inspecting Resources ---');
  const { data: res } = await supabase.from('resources').select('*').limit(1);
  console.log('Resources row keys:', res?.[0] ? Object.keys(res[0]) : 'Empty');
  console.log('Sample resource:', res?.[0]);

  console.log('--- Inspecting Resource Requests ---');
  const { data: req } = await supabase.from('resource_requests').select('*').limit(1);
  console.log('Resource requests row keys:', req?.[0] ? Object.keys(req[0]) : 'Empty');
  console.log('Sample request:', req?.[0]);

  console.log('--- Inspecting Interviews ---');
  const { data: ints } = await supabase.from('interviews').select('*').limit(1);
  console.log('Interviews row keys:', ints?.[0] ? Object.keys(ints[0]) : 'Empty');
  console.log('Sample interview:', ints?.[0]);

  console.log('--- Inspecting Job Applications ---');
  const { data: apps } = await supabase.from('job_applications').select('*').limit(1);
  console.log('Job Applications row keys:', apps?.[0] ? Object.keys(apps[0]) : 'Empty');
}

inspect();
