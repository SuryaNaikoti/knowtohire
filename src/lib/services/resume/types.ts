export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
}

export interface CandidateResume {
  id: string;
  candidateId: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  updatedAt: string;
}
