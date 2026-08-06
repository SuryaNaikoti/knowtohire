import { createClient } from '@supabase/supabase-js';

const PAT = process.env.SUPABASE_PAT || process.env.SUPABASE_MANAGEMENT_PAT || '';
const PROJECT_REF = 'roqbodprqmnwxdjsskgb';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

interface ApiKey {
  name: string;
  api_key: string;
}

async function runLiveSeeding() {
  console.log('----------------------------------------------------');
  console.log('🔑 Fetching Supabase API Keys via Management PAT...');
  console.log('----------------------------------------------------');

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to fetch API keys:', res.status, errText);
      return;
    }

    const keys: ApiKey[] = await res.json();
    const serviceRoleKey = keys.find(k => k.name === 'service_role')?.api_key;
    const anonKey = keys.find(k => k.name === 'anon')?.api_key;

    console.log('Found Service Role Key:', serviceRoleKey ? 'YES ✅' : 'NO ❌');
    console.log('Found Anon Key:', anonKey ? 'YES ✅' : 'NO ❌');

    const keyToUse = serviceRoleKey || anonKey || '';
    const supabaseAdmin = createClient(SUPABASE_URL, keyToUse, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const demoAccounts = [
      { email: 'admin@knowtohire.com', password: 'Admin@123', role: 'super_admin', first_name: 'Rajeev', last_name: 'Sharma', headline: 'Platform Director & Chief Administrator' },
      { email: 'hr@greenearthconsultants.com', password: 'Employer@123', role: 'employer', first_name: 'Arjun', last_name: 'Mehta', headline: 'HR Manager at GreenEarth Consultants' },
      { email: 'careers@sustainedge.com', password: 'Employer@123', role: 'employer', first_name: 'Priya', last_name: 'Nair', headline: 'Talent Acquisition Head at SustainEdge Consulting' },
      { email: 'jobs@patentnexus.com', password: 'Employer@123', role: 'employer', first_name: 'Rohit', last_name: 'Verma', headline: 'Recruitment Lead at Patent Nexus' },
      { email: 'rahul.sharma@gmail.com', password: 'Candidate@123', role: 'candidate', first_name: 'Rahul', last_name: 'Sharma', headline: 'Senior Environmental Engineer (3 Yrs Exp)' },
      { email: 'sneha.reddy@gmail.com', password: 'Candidate@123', role: 'candidate', first_name: 'Sneha', last_name: 'Reddy', headline: 'Lead ESG Consultant (5 Yrs Exp)' },
      { email: 'aditya.rao@gmail.com', password: 'Candidate@123', role: 'candidate', first_name: 'Aditya', last_name: 'Rao', headline: 'Patent Associate (4 Yrs Exp)' },
      { email: 'neha.kapoor@gmail.com', password: 'Candidate@123', role: 'candidate', first_name: 'Neha', last_name: 'Kapoor', headline: 'Research Associate (2 Yrs Exp)' }
    ];

    console.log('\n----------------------------------------------------');
    console.log('👤 Provisioning Auth Users via Admin API...');
    console.log('----------------------------------------------------');

    for (const acc of demoAccounts) {
      if (serviceRoleKey && supabaseAdmin.auth.admin) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            first_name: acc.first_name,
            last_name: acc.last_name,
            role: acc.role
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            console.log(`[AUTH] User ${acc.email} already exists in auth.users (Skipped creation)`);
          } else {
            console.warn(`[AUTH] Admin createUser warning for ${acc.email}:`, error.message);
          }
        } else {
          console.log(`[AUTH] Successfully created user in auth.users: ${acc.email} (${data.user.id})`);
        }
      }

      // Upsert profile in public.profiles table
      const { error: profileErr } = await supabaseAdmin
        .from('profiles')
        .upsert({
          email: acc.email,
          role: acc.role,
          first_name: acc.first_name,
          last_name: acc.last_name,
          headline: acc.headline,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (profileErr) {
        console.warn(`[PROFILE] Profile upsert warning for ${acc.email}:`, profileErr.message);
      } else {
        console.log(`[PROFILE] Synced profile record: ${acc.email}`);
      }
    }

    console.log('\n----------------------------------------------------');
    console.log('✅ LIVE SEEDING FINISHED SUCCESSFULLY!');
    console.log('----------------------------------------------------');

  } catch (err: any) {
    console.error('Error running live seeding:', err.message || err);
  }
}

runLiveSeeding();
