import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMoreTypes() {
  await supabase.auth.signInWithPassword({
    email: 'cand_1786972983967@hutdot.com',
    password: 'Password123!',
  });
  const { data: user } = await supabase.auth.getUser();

  const candidateTypes = ['guide', 'template', 'other', 'whitepaper', 'white_paper', 'report', 'book', 'course', 'document'];
  for (const t of candidateTypes) {
    const { data, error } = await supabase.from('resource_requests').insert({
      user_id: user?.user?.id,
      title: `Test ${t}`,
      description: 'Testing type constraint',
      category: 'ESG',
      type: t,
      status: 'pending',
    }).select('*');
    console.log(`Type "${t}":`, error ? `ERROR: ${error.message}` : `SUCCESS: ID ${data?.[0]?.id}`);
    if (data?.[0]?.id) {
      await supabase.from('resource_requests').delete().eq('id', data[0].id);
    }
  }
}

testMoreTypes();
