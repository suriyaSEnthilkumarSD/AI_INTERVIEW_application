import api from "./axios";

export interface OverallStats {
  total_problems: number;
  solved_problems: number;
  attempted_problems: number;
  not_attempted_problems: number;
}

export interface DifficultyStats {
  difficulty: string;

  total: number;
  solved: number;
  attempted: number;
  not_attempted: number;
}

export interface AcceptanceStats {
  total_attempts: number;
  accepted_attempts: number;
  failed_attempts: number;

  acceptance_rate: number;
}

export interface RecentSubmission {
  submission_id: string;

  problem_id: number;
  problem_title: string;

  status: string;
  language: string;

  created_at: string;
}

export interface DashboardResponse {
  overall: OverallStats;

  difficulty_stats: DifficultyStats[];

  acceptance: AcceptanceStats;

  recent_submissions: RecentSubmission[];
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>("/dashboard");

  return response.data;
};