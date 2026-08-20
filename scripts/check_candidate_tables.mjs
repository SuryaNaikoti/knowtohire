import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCandAndSaved() {
  await supabase.auth.signInWithPassword({
    email: 'cilove3743@hutdot.com',
    password: 'Password123!',
  });

  console.log('--- Checking candidate_profiles ---');
  const { data: cands, error: candErr } = await supabase.from('candidate_profiles').select('*');
  console.log('Candidate profiles count:', cands?.length, 'Error:', candErr);
  if (cands?.length) console.log('Sample candidate profile:', cands[0]);

  console.log('--- Checking saved_candidates ---');
  const { data: saved, error: savedErr } = await supabase.from('saved_candidates').select('*');
  console.log('Saved candidates count:', saved?.length, 'Error:', savedErr);
  if (savedErr) console.log('Saved candidates select error:', savedErr);

  // Test insert into saved_candidates
  const { data: user } = await supabase.auth.getUser();
  const testInsert = await supabase.from('saved_candidates').insert({
    employer_id: user.user.id,
    candidate_id: '7dda3210-d657-43d9-bf92-4c3a39cf012d',
    notes: 'Test note',
  }).select('*');
  console.log('Test saved_candidates insert:', testInsert);
}

checkCandAndSaved();
