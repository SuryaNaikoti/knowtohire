export interface ParsedResumeDataV1 {
  version: 'v1';
  data: {
    name?: string;
    email?: string;
    phone?: string;
    headline?: string;
    location?: string;
    summary?: string;
    currentDesignation?: string;
    currentCompany?: string;
    experienceYears?: number;
    skills?: { skill_name: string; years_of_experience: number; competency_level: 'Beginner' | 'Intermediate' | 'Expert' }[];
    education?: { institution: string; degree: string; field_of_study: string; start_date: string; end_date: string }[];
    workExperience?: { company_name: string; role_title: string; description: string; start_date: string; end_date?: string; is_current: boolean }[];
    certifications?: { name: string; issuing_organization: string; expiration_date: string }[];
    projects?: { title: string; description: string }[];
    languages?: string[];
    linkedin?: string;
    github?: string;
    portfolioWebsite?: string;
  };
  confidenceScores: {
    name?: number;
    email?: number;
    phone?: number;
    headline?: number;
    location?: number;
    summary?: number;
    experienceYears?: number;
    skills?: number;
  };
}

export type ParsedResumeData = ParsedResumeDataV1;

export interface IResumeParser {
  parse(file: File, onProgress?: (step: string, progress: number) => void): Promise<ParsedResumeData>;
}

export class MockResumeParser implements IResumeParser {
  async parse(file: File, onProgress?: (step: string, progress: number) => void): Promise<ParsedResumeData> {
    const steps = [
      { msg: 'Uploading Resume...', delay: 400 },
      { msg: 'Analyzing Resume...', delay: 600 },
      { msg: 'Extracting Skills...', delay: 600 },
      { msg: 'Populating Profile...', delay: 400 }
    ];

    for (let i = 0; i < steps.length; i++) {
      if (onProgress) {
        onProgress(steps[i].msg, Math.round(((i + 1) / steps.length) * 100));
      }
      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
    }

    const nameLower = file.name.toLowerCase();

    // Default: Surya Naikoti - React/TS Developer
    let parsed: ParsedResumeData = {
      version: 'v1',
      data: {
        name: 'Surya Naikoti',
        email: 'surya.naikoti@example.com',
        phone: '+91 98765 43210',
        headline: 'Senior Frontend Engineer',
        location: 'Mumbai, Maharashtra',
        summary: 'Experienced Senior Frontend Engineer with 8+ years of expertise in building high-performance web applications using React, TypeScript, and modern state management tools.',
        currentDesignation: 'Senior Frontend Engineer',
        currentCompany: 'Tech Solutions Inc',
        experienceYears: 8,
        skills: [
          { skill_name: 'React', years_of_experience: 8, competency_level: 'Expert' },
          { skill_name: 'TypeScript', years_of_experience: 6, competency_level: 'Expert' },
          { skill_name: 'Next.js', years_of_experience: 4, competency_level: 'Intermediate' },
          { skill_name: 'Tailwind CSS', years_of_experience: 5, competency_level: 'Intermediate' }
        ],
        workExperience: [
          {
            company_name: 'Tech Solutions Inc',
            role_title: 'Senior Frontend Engineer',
            description: 'Orchestrated the migration of legacy dashboards to React and Next.js, improving load performance by 40%. Led a team of 4 engineers.',
            start_date: '2021-06-01',
            is_current: true
          }
        ],
        education: [
          {
            institution: 'National Institute of Technology',
            degree: 'Bachelor of Technology',
            field_of_study: 'Computer Science',
            start_date: '2014-07-01',
            end_date: '2018-05-31'
          }
        ],
        certifications: [
          {
            name: 'AWS Certified Solutions Architect',
            issuing_organization: 'Amazon Web Services',
            expiration_date: '2027-06-30'
          }
        ],
        projects: [
          {
            title: 'KnowToHire Platform',
            description: 'A scalable SaaS career intelligence and job matching platform built with React, Tailwind CSS, and Supabase.'
          }
        ],
        languages: ['English', 'Telugu', 'Hindi'],
        linkedin: 'https://linkedin.com/in/suryanaikoti',
        github: 'https://github.com/suryanaikoti',
        portfolioWebsite: 'https://suryanaikoti.dev'
      },
      confidenceScores: {
        name: 99,
        email: 100,
        phone: 95,
        headline: 98,
        location: 90,
        summary: 96,
        experienceYears: 92,
        skills: 95
      }
    };

    // Design keyword customizer
    if (nameLower.includes('design') || nameLower.includes('creative')) {
      parsed = {
        version: 'v1',
        data: {
          name: 'Jane Doe',
          email: 'jane.doe@designstudio.com',
          phone: '+1 (555) 019-2834',
          headline: 'Lead UI/UX Designer',
          location: 'San Francisco, CA',
          summary: 'Creative UI/UX Designer passionate about crafting human-centered digital experiences with focus on accessibility and interactive prototype design.',
          currentDesignation: 'Lead UI/UX Designer',
          currentCompany: 'Creative Designs Co',
          experienceYears: 5,
          skills: [
            { skill_name: 'Figma', years_of_experience: 5, competency_level: 'Expert' },
            { skill_name: 'UI/UX Design', years_of_experience: 5, competency_level: 'Expert' },
            { skill_name: 'Wireframing', years_of_experience: 4, competency_level: 'Intermediate' },
            { skill_name: 'Prototyping', years_of_experience: 4, competency_level: 'Intermediate' }
          ],
          workExperience: [
            {
              company_name: 'Creative Designs Co',
              role_title: 'UI/UX Lead Designer',
              description: 'Redesigned core mobile application onboarding flow, increasing successful user conversions by 35%. Establised global design system.',
              start_date: '2022-03-15',
              is_current: true
            }
          ],
          education: [
            {
              institution: 'School of Visual Arts',
              degree: 'Master of Fine Arts',
              field_of_study: 'Interaction Design',
              start_date: '2016-09-01',
              end_date: '2018-05-15'
            }
          ],
          certifications: [
            {
              name: 'Google UX Design Professional Certificate',
              issuing_organization: 'Coursera / Google',
              expiration_date: '2029-12-31'
            }
          ],
          projects: [
            {
              title: 'Fintech Dashboard Redesign',
              description: 'Conducted user research and built interactive prototypes for a secure wealth management web portal.'
            }
          ],
          languages: ['English', 'Spanish'],
          linkedin: 'https://linkedin.com/in/janedoe',
          github: 'https://github.com/janedoe',
          portfolioWebsite: 'https://janedoe.design'
        },
        confidenceScores: {
          name: 98,
          email: 100,
          phone: 92,
          headline: 97,
          location: 94,
          summary: 95,
          experienceYears: 90,
          skills: 93
        }
      };
    } else if (nameLower.includes('product') || nameLower.includes('manager')) {
      parsed = {
        version: 'v1',
        data: {
          name: 'David Miller',
          email: 'david.miller@productlab.io',
          phone: '+44 7700 900077',
          headline: 'Lead Product Manager',
          location: 'London, UK',
          summary: 'Results-driven Product Manager with a track record of launching scalable SaaS products and driving user engagement using data-driven insights.',
          currentDesignation: 'Lead Product Manager',
          currentCompany: 'Product Lab',
          experienceYears: 6,
          skills: [
            { skill_name: 'Product Roadmap', years_of_experience: 6, competency_level: 'Expert' },
            { skill_name: 'Agile/Scrum', years_of_experience: 6, competency_level: 'Expert' },
            { skill_name: 'SQL Analytics', years_of_experience: 4, competency_level: 'Intermediate' },
            { skill_name: 'Jira', years_of_experience: 5, competency_level: 'Intermediate' }
          ],
          workExperience: [
            {
              company_name: 'Product Lab',
              role_title: 'Lead Product Manager',
              description: 'Managed product lifecycle for enterprise communication tool. Increased monthly active users by 50% through viral features.',
              start_date: '2020-08-01',
              is_current: true
            }
          ],
          education: [
            {
              institution: 'University of Oxford',
              degree: 'MBA',
              field_of_study: 'Business Administration',
              start_date: '2017-10-01',
              end_date: '2018-09-30'
            }
          ],
          certifications: [
            {
              name: 'Certified Scrum Product Owner (CSPO)',
              issuing_organization: 'Scrum Alliance',
              expiration_date: '2026-10-31'
            }
          ],
          projects: [
            {
              title: 'SaaS Billing Migration',
              description: 'Spearheaded the integration of multi-currency billing gateways, reducing transaction failures by 12%.'
            }
          ],
          languages: ['English', 'French'],
          linkedin: 'https://linkedin.com/in/davidmiller',
          github: 'https://github.com/davidmiller',
          portfolioWebsite: 'https://davidmiller.pm'
        },
        confidenceScores: {
          name: 99,
          email: 100,
          phone: 96,
          headline: 98,
          location: 92,
          summary: 94,
          experienceYears: 91,
          skills: 95
        }
      };
    }

    return parsed;
  }
}

export class ResumeParserManager {
  private static parser: IResumeParser = new MockResumeParser();

  static setParser(customParser: IResumeParser) {
    this.parser = customParser;
  }

  static getParser(): IResumeParser {
    return this.parser;
  }
}
