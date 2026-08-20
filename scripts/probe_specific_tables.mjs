import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probe() {
  console.log('--- Probing Resources Table ---');
  const { data: resData, error: resErr } = await supabase.from('resources').select('*');
  console.log('Resources select count:', resData?.length, 'Error:', resErr);

  console.log('--- Probing Resource Requests Table ---');
  // Authenticate as Candidate
  await supabase.auth.signInWithPassword({
    email: 'cand_1786972983967@hutdot.com',
    password: 'Password123!',
  });
  const { data: user } = await supabase.auth.getUser();
  console.log('Authenticated Candidate UID:', user?.user?.id);

  const { data: reqInsert, error: reqErr } = await supabase.from('resource_requests').insert({
    user_id: user?.user?.id,
    title: 'Test Request',
    description: 'Test Description',
    category: 'Environmental',
    type: 'Guide',
    status: 'pending',
  }).select('*');
  console.log('Resource Requests Insert result:', reqInsert, 'Error:', reqErr);

  console.log('--- Probing Interviews Table ---');
  // Authenticate as Employer
  await supabase.auth.signInWithPassword({
    email: 'cilove3743@hutdot.com',
    password: 'Password123!',
  });
  const { data: empUser } = await supabase.auth.getUser();
  console.log('Authenticated Employer UID:', empUser?.user?.id);

  const { data: intInsert, error: intErr } = await supabase.from('interviews').insert({
    candidate_id: user?.user?.id,
    title: 'Round 1 Technical',
    interview_type: 'technical',
    scheduled_at: new Date().toISOString(),
    status: 'scheduled',
  }).select('*');
  console.log('Interviews Insert result:', intInsert, 'Error:', intErr);
}

probe();
