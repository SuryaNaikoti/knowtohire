export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COMING_SOON: '/coming-soon',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:id',
  RESOURCES: '/resources',
  RESOURCE_DETAILS: '/resources/:id',
  TEMPLATES: '/templates',
  TEMPLATE_DETAILS: '/templates/:id',
  BLOG: '/blog',
  PRICING: '/pricing',
  
  
  DASHBOARD: {
    ROOT: '/dashboard',
    CANDIDATE: {
      ROOT: '/dashboard/candidate',
      PORTFOLIO: '/dashboard/candidate/portfolio',
      EXPERIENCE: '/dashboard/candidate/experience',
      SKILLS: '/dashboard/candidate/skills',
      JOBS: '/dashboard/candidate/jobs',
      SAVED: '/dashboard/candidate/saved',
    },
    EMPLOYER: {
      ROOT: '/dashboard/employer',
      COMPANY: '/dashboard/employer/company',
      LOCATIONS: '/dashboard/employer/locations',
      TEAM: '/dashboard/employer/team',
      JOBS: '/dashboard/employer/jobs',
      CREATE_JOB: '/dashboard/employer/jobs/create',
    },
    ADMIN: {
      ROOT: '/dashboard/admin',
      MODERATION: '/dashboard/admin/moderation',
    }
  }
} as const;
