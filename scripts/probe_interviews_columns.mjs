import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probeInterviews() {
  await supabase.auth.signInWithPassword({
    email: 'cilove3743@hutdot.com',
    password: 'Password123!',
  });
  const { data: user } = await supabase.auth.getUser();

  // Query existing job application
  const { data: app } = await supabase.from('job_applications').select('*').limit(1).single();

  // Test insert using scheduled_start
  const payload = {
    application_id: app.id,
    job_id: app.job_id,
    company_id: app.company_id,
    candidate_id: app.candidate_id,
    title: 'Technical Discussion',
    interview_type: 'technical_deep_dive',
    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
    scheduled_end: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    meeting_link: 'https://meet.google.com/test-abc',
    status: 'scheduled',
    created_by: user?.user?.id,
  };

  const { data, error } = await supabase.from('interviews').insert(payload).select('*');
  console.log('Interviews insert with scheduled_start result:', data, 'Error:', error);

  if (data?.[0]?.id) {
    console.log('Row inserted keys:', Object.keys(data[0]));
    await supabase.from('interviews').delete().eq('id', data[0].id);
  }
}

probeInterviews();
