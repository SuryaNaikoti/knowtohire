import { createClient } from '@supabase/supabase-js';

// Read configuration from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LaaDEhdZxxR36h28ZuMVHw_piI-yOpv';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export interface DemoUserSeedConfig {
  email: string;
  password: string;
  role: 'super_admin' | 'employer' | 'candidate';
  first_name: string;
  last_name: string;
  headline?: string;
  avatar_url?: string;
}

export const DEMO_USERS: DemoUserSeedConfig[] = [
  {
    email: 'admin@knowtohire.com',
    password: 'Admin@123',
    role: 'super_admin',
    first_name: 'Rajeev',
    last_name: 'Sharma',
    headline: 'Platform Director & Chief Administrator',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'hr@greenearthconsultants.com',
    password: 'Employer@123',
    role: 'employer',
    first_name: 'Arjun',
    last_name: 'Mehta',
    headline: 'HR Manager at GreenEarth Consultants',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'careers@sustainedge.com',
    password: 'Employer@123',
    role: 'employer',
    first_name: 'Priya',
    last_name: 'Nair',
    headline: 'Talent Acquisition Head at SustainEdge Consulting',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'jobs@patentnexus.com',
    password: 'Employer@123',
    role: 'employer',
    first_name: 'Rohit',
    last_name: 'Verma',
    headline: 'Recruitment Lead at Patent Nexus',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'rahul.sharma@gmail.com',
    password: 'Candidate@123',
    role: 'candidate',
    first_name: 'Rahul',
    last_name: 'Sharma',
    headline: 'Senior Environmental Engineer (3 Yrs Exp)',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'sneha.reddy@gmail.com',
    password: 'Candidate@123',
    role: 'candidate',
    first_name: 'Sneha',
    last_name: 'Reddy',
    headline: 'Lead ESG Consultant (5 Yrs Exp)',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'aditya.rao@gmail.com',
    password: 'Candidate@123',
    role: 'candidate',
    first_name: 'Aditya',
    last_name: 'Rao',
    headline: 'Patent Associate (4 Yrs Exp)',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'neha.kapoor@gmail.com',
    password: 'Candidate@123',
    role: 'candidate',
    first_name: 'Neha',
    last_name: 'Kapoor',
    headline: 'Research Associate (2 Yrs Exp)',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80',
  },
];

export async function seedDemoUsers() {
  console.log('----------------------------------------------------');
  console.log('🚀 KnowToHire Version 1.0 — Demo User Provisioning');
  console.log('----------------------------------------------------');

  for (const userConfig of DEMO_USERS) {
    try {
      let userId: string | undefined;

      // Check Admin Auth API capability
      if (supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
        const { data: created, error: adminErr } = await supabase.auth.admin.createUser({
          email: userConfig.email,
          password: userConfig.password,
          email_confirm: true,
          user_metadata: {
            first_name: userConfig.first_name,
            last_name: userConfig.last_name,
            role: userConfig.role,
          },
        });

        if (!adminErr && created?.user) {
          userId = created.user.id;
          console.log(`[AUTH] Created Auth user via Admin API: ${userConfig.email} (${userId})`);
        } else if (adminErr && adminErr.message?.includes('already registered')) {
          console.log(`[AUTH] User already registered in Auth: ${userConfig.email} (Skipped creation)`);
        }
      }

      // Fallback Signup method for standard Anon client
      if (!userId) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: userConfig.email,
          password: userConfig.password,
          options: {
            data: {
              first_name: userConfig.first_name,
              last_name: userConfig.last_name,
              role: userConfig.role,
            },
          },
        });

        if (!signUpErr && signUpData?.user) {
          userId = signUpData.user.id;
          console.log(`[AUTH] Provisioned Auth user via SignUp: ${userConfig.email}`);
        }
      }

      // Upsert profile record idempotently
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert(
          {
            email: userConfig.email,
            role: userConfig.role,
            first_name: userConfig.first_name,
            last_name: userConfig.last_name,
            headline: userConfig.headline,
            avatar_url: userConfig.avatar_url,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

      if (profileErr) {
        console.warn(`[PROFILE] Notice upserting profile for ${userConfig.email}:`, profileErr.message);
      } else {
        console.log(`[PROFILE] Synced profile record for ${userConfig.email} (${userConfig.role})`);
      }
    } catch (err: any) {
      console.error(`[ERROR] User seeding error for ${userConfig.email}:`, err.message || err);
    }
  }

  console.log('\n✅ Demo User Provisioning Complete!\n');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed-demo-users.ts')) {
  seedDemoUsers().catch(console.error);
}
