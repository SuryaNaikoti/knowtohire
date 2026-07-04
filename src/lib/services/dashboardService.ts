import { candidateService } from './candidateService';
import { employerService } from './employerService';
import { jobsService } from './jobsService';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface CandidateKPIs {
  profileStrength: number;
  cvDownloaded: boolean;
  activeAppsCount: number;
  cvDownloadsCount: number;
  profileViewsCount: number;
  applications: any[];
}

export interface EmployerKPIs {
  completionScore: number;
  teamCount: number;
  activePostingsCount: number;
  interviewsCount: number;
  applicants: any[];
  stats: any[];
}

export interface AdminKPIs {
  pendingModerationCount: number;
  totalJobsCount: number;
  totalCompaniesCount: number;
  totalUsersCount: number;
}

export const dashboardService = {
  getCandidateKPIs: async (candidateId: string): Promise<CandidateKPIs> => {
    try {
      const [profile, skills, exp, edu, certs] = await Promise.all([
        candidateService.getProfile(candidateId),
        candidateService.getSkills(candidateId),
        candidateService.getExperience(candidateId),
        candidateService.getEducation(candidateId),
        candidateService.getCertifications(candidateId)
      ]);

      // Calculate Candidate Profile Strength
      let score = 0;
      let resumeExists = false;
      if (profile?.bio) score += 20;
      if (profile?.resume_url) {
        score += 20;
        resumeExists = true;
      }
      if (skills && skills.length > 0) score += 5;
      if (skills && skills.length >= 3) score += 5;
      if (exp && exp.length > 0) score += 20;
      if (edu && edu.length > 0) score += 20;
      if (certs && certs.length > 0) score += 10;

      // Mock Applications details for display
      const mockApplications = [
        { company: 'InnoTech Solutions', role: 'Senior React Developer', status: 'Interviewing', date: '2 days ago', match: '98%' },
        { company: 'CloudBase Corp', role: 'Frontend Architect', status: 'Under Review', date: '5 days ago', match: '95%' },
        { company: 'EdLearn Systems', role: 'Full Stack Engineer', status: 'Offer Received', date: '1 week ago', match: '92%' },
      ];

      return {
        profileStrength: score,
        cvDownloaded: resumeExists,
        activeAppsCount: mockApplications.length,
        cvDownloadsCount: resumeExists ? 19 : 0,
        profileViewsCount: 142,
        applications: mockApplications
      };
    } catch (err) {
      console.error('[dashboardService.getCandidateKPIs error]', err);
      throw err;
    }
  },

  getEmployerKPIs: async (employerId: string): Promise<EmployerKPIs> => {
    try {
      const comp = await employerService.getCompanyByEmployer(employerId);
      if (!comp) {
        return {
          completionScore: 0,
          teamCount: 0,
          activePostingsCount: 0,
          interviewsCount: 0,
          applicants: [],
          stats: []
        };
      }

      const [locs, team, jobs] = await Promise.all([
        employerService.getLocations(comp.id),
        employerService.getTeamMembers(comp.id),
        jobsService.getCompanyJobs(comp.id)
      ]);

      // Calculate Company Profile Completion Meter
      let score = 0;
      if (comp.name) score += 20;
      if (comp.logo_url) score += 15;
      if (comp.banner_url) score += 15;
      if (comp.company_email) score += 10;
      if (comp.linkedin_url) score += 10;
      if (comp.website_url) score += 10;
      if (comp.description) score += 10;
      if (locs && locs.length > 0) score += 10;

      // Filter active published jobs
      const activePostings = jobs.filter(j => j.status === 'published' && j.approval_status === 'approved').length;

      // Mock Applications details for recruiter
      const mockApplicants = [
        { name: 'Alex Johnson', role: 'Senior React Developer', match: '98%', status: 'Technical Round', experience: '6 Yrs' },
        { name: 'Michael Chen', role: 'Frontend Architect', match: '95%', status: 'Screening', experience: '8 Yrs' },
        { name: 'David Miller', role: 'Full Stack Engineer', match: '92%', status: 'Manager Review', experience: '5 Yrs' },
      ];

      const stats = [
        { label: 'Active Postings', value: activePostings.toString(), desc: 'Approved vacancies' },
        { label: 'Recruiters Vetted', value: team.length.toString(), desc: 'Active team seats' },
        { label: 'Interviews Booked', value: '5', desc: 'Next: Today at 2:00 PM' },
      ];

      return {
        completionScore: score,
        teamCount: team.length,
        activePostingsCount: activePostings,
        interviewsCount: 5,
        applicants: mockApplicants,
        stats
      };
    } catch (err) {
      console.error('[dashboardService.getEmployerKPIs error]', err);
      throw err;
    }
  },

  getAdminKPIs: async (): Promise<AdminKPIs> => {
    try {
      const pendingJobs = await jobsService.getPendingApprovalJobs();
      
      let totalJobs = 3;
      let totalCompanies = 1;
      let totalUsers = 5;

      if (isSupabaseConfigured && supabase) {
        const [jobsRes, companiesRes, profilesRes] = await Promise.all([
          supabase.from('jobs').select('id', { count: 'exact', head: true }),
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('employer_profiles').select('id', { count: 'exact', head: true })
        ]);
        
        totalJobs = jobsRes.count || 0;
        totalCompanies = companiesRes.count || 0;
        totalUsers = (profilesRes.count || 0) + 2; // Simulated total
      } else {
        const kthJobs = localStorage.getItem('kth_jobs');
        if (kthJobs) {
          totalJobs = JSON.parse(kthJobs).length;
        }
      }

      return {
        pendingModerationCount: pendingJobs.length,
        totalJobsCount: totalJobs,
        totalCompaniesCount: totalCompanies,
        totalUsersCount: totalUsers
      };
    } catch (err) {
      console.error('[dashboardService.getAdminKPIs error]', err);
      throw err;
    }
  }
};
