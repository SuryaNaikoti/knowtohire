import { createClient } from '../node_modules/@supabase/supabase-js/dist/module/index.js';

const supabaseUrl = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODkxMTcsImV4cCI6MjA1NDk2NTExN30.K5D5q_924mJ5Hk2p_3l-zU66W7F-6jK-P_8q5_k6-eQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('Testing select on jobs...');
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  console.log('jobs select *:', { data, error });

  console.log('Testing select jobs with company_profiles join...');
  const { data: joinData, error: joinErr } = await supabase.from('jobs').select('*, company_profiles(*)').limit(1);
  console.log('jobs join company_profiles:', { joinData, joinErr });

  console.log('Testing select jobs with company:company_profiles join...');
  const { data: joinData2, error: joinErr2 } = await supabase.from('jobs').select('*, company:company_profiles(*)').limit(1);
  console.log('jobs join company:company_profiles:', { joinData2, joinErr2 });
}

inspect();
