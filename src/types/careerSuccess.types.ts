export type InterviewType = 'Technical' | 'Behavioral' | 'System Design' | 'HR & Cultural' | 'Domain Specialist';

export interface InterviewQuestionFeedback {
  id: string;
  question_text: string;
  candidate_answer: string;
  clarity_score: number; // 1-100
  relevance_score: number; // 1-100
  technical_depth_score: number; // 1-100
  ai_feedback: string;
  model_answer_suggestion: string;
  demonstrated_skills: string[];
}

export interface InterviewSimulationSession {
  id: string;
  candidate_id: string;
  interview_type: InterviewType;
  target_role_title: string;
  overall_rating: number; // 1-100%
  completed_at: string;
  questions_feedback: InterviewQuestionFeedback[];
}

export interface OutcomeLinkedLearningNode {
  id: string;
  skill_name: string;
  category: string;
  fit_impact_percent_boost: number; // e.g. +11%
  target_opportunity_count: number; // e.g. 142 roles
  estimated_hours_to_master: number;
  recommended_course_url?: string;
  status: 'Not Started' | 'In Progress' | 'Mastered';
}

export interface CareerProgressionSimulationResult {
  scenario_name: string;
  simulated_skill_additions: string[];
  simulated_certifications: string[];
  simulated_additional_years: number;
  initial_fit_score: number;
  simulated_fit_score: number;
  unlocked_opportunity_count: number;
  estimated_salary_boost_amount: string;
}
