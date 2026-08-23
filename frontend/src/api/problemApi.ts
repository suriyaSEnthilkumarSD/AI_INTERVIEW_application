import api from "./axios";

export type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export interface ProblemSummary {
  problem_id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
}

export interface ProblemListResponse {
  problems: ProblemSummary[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Hint {
  level: number;
  text: string;
}

export interface ProblemContent {
  description: string;
  constraints: string[];
  inputDescription: string;
  outputDescription: string;
  hints: Hint[];
}

export interface StarterCode {
  python: string;
  cpp: string;
  java: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
}

export interface FunctionSignature {
  name: string;
  parameters: FunctionParameter[];
  returnType: string;
}

export interface ProblemCode {
  supportedLanguages: string[];
  starterCode: StarterCode;
  functionSignature: FunctionSignature;
}

export interface TestCase {
  id: string;
  input: Record<string, unknown>;
  expectedOutput: unknown;
  visibility: string;
  comparison: string;
}

export interface ProblemEvaluation {
  testCases: TestCase[];
}

export interface SolutionContext {
  optimalApproach: string;
  approachExplanation: string;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
}

export interface ProblemMetadata {
  source: string;
  leetcodeId: number;
}

export interface ProblemDetail {
  problem_id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];

  content: ProblemContent;
  code: ProblemCode;
  evaluation: ProblemEvaluation;
  solutionContext: SolutionContext;
  metadata: ProblemMetadata;
}

export const getProblems = async (
  page = 1,
  limit = 20,
  difficulty?: Difficulty
): Promise<ProblemListResponse> => {
  const response = await api.get<ProblemListResponse>(
    "/problems",
    {
      params: {
        page,
        limit,
        ...(difficulty ? { difficulty } : {}),
      },
    }
  );

  return response.data;
};

export const getProblemById = async (
  problemId: number
): Promise<ProblemDetail> => {
  const response = await api.get<ProblemDetail>(
    `/problems/${problemId}`
  );

  return response.data;
};

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}