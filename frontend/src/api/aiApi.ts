import api from "./axios";

export type AIAnalysisMode =
  | "hint"
  | "analysis"
  | "optimization"
  | "explain";

export interface AIAnalysisRequest {
  submission_id: string;
  mode: AIAnalysisMode;
}

export interface ComplexityAnalysis {
  current_time: string | null;
  current_space: string | null;

  expected_time: string | null;
  expected_space: string | null;
}

export interface AIAnalysisResponse {
  summary: string;

  issue: string | null;

  hint: string | null;

  edge_cases: string[];

  complexity_analysis: ComplexityAnalysis;

  suggested_improvement: string | null;
}

export const analyzeSubmission = async (
  data: AIAnalysisRequest
): Promise<AIAnalysisResponse> => {
  const response = await api.post<AIAnalysisResponse>(
    "/ai/analyze",
    data
  );

  return response.data;
};