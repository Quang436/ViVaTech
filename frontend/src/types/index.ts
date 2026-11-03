export type CouncilPersona = 'feynman' | 'academic_reviewer' | 'strict_council';

export interface PersonaInfo {
  id: CouncilPersona;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  avatarIcon: string;
  accentColor: string;
  difficulty: 'Dễ' | 'Vừa' | 'Khó (Stress-Test)';
}

export interface UploadedDocument {
  document_id: string;
  filename: string;
  total_chunks: number;
  pages: number;
  file_size_bytes: number;
  summary: string;
  created_at?: string;
  message?: string;
}

export interface DebateTurn {
  id: string;
  turn_number: number;
  council_speaker: string;
  ai_question: string;
  student_response?: string | null;
  response_mode?: 'voice' | 'text';
  duration_seconds?: number;
  ground_truth_accuracy?: number;
  logic_flaws?: string[];
  critique_comment?: string;
  timestamp: string;
  ai_thought_process?: {
    step1_fact_check?: string;
    step2_logic_flaws?: string[];
    step3_rebuttal_strategy?: string;
  };
}

export interface DebateSession {
  id: string;
  title: string;
  persona: CouncilPersona;
  topic_summary?: string;
  document_id?: string;
  document_name?: string;
  status: 'pending' | 'in_progress' | 'completed';
  max_turns: number;
  current_turn: number;
  created_at: string;
  turns: DebateTurn[];
}

export interface OptimalAnswerItem {
  turn_number: number;
  question: string;
  student_answer_summary: string;
  optimal_answer: string;
  key_takeaway: string;
}

export interface Scorecard {
  id: string;
  session_id: string;
  overall_score: number;
  logic_accuracy_score: number;
  argumentation_score: number;
  composure_score: number;
  clarity_score: number;
  strengths: string[];
  weaknesses: string[];
  fallacies_summary: string[];
  optimal_answers: OptimalAnswerItem[];
  overall_verdict: string;
  created_at: string;
}

export interface RebuttalResponse {
  session_id: string;
  turn_number: number;
  is_completed: boolean;
  critique_previous_answer?: string;
  detected_flaws: string[];
  ground_truth_accuracy: number;
  next_question?: string;
  council_speaker: string;
  cot_reasoning?: {
    step1_fact_check?: string;
    step2_logic_flaws?: string[];
    step3_rebuttal_strategy?: string;
  };
}
