import api from "./axios";


/* =========================================
   LANGUAGE
========================================= */

export type Language =
  | "python"
  | "cpp"
  | "java";


/* =========================================
   SUBMISSION STATUS
========================================= */

export type SubmissionStatus =
  | "Pending"
  | "Running"
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Compilation Error"
  | "Time Limit Exceeded"
  | "Memory Limit Exceeded";


/* =========================================
   SUBMIT CODE
========================================= */

export interface SubmissionCreate {
  problem_id: number;
  language: Language;
  source_code: string;
}


export interface SubmissionResponse {
  submission_id: string;

  user_id: string;
  problem_id: number;

  language: Language;
  status: SubmissionStatus;

  test_cases_passed: number;
  total_test_cases: number;

  execution_time: number | null;
  memory_used: number | null;

  error: string | null;

  created_at: string;
  updated_at: string;
}


export interface SubmissionDetailResponse
  extends SubmissionResponse {
  source_code: string;
}


/* =========================================
   RUN CODE
========================================= */

export interface RunCodeRequest {
  problem_id: number;

  language: Language;

  source_code: string;
}


export interface TestCaseRunResult {
  test_case_id: string;

  passed: boolean;

  actual_output: unknown | null;

  expected_output: unknown | null;

  error: string | null;
}


export interface RunCodeResponse {
  status: SubmissionStatus;

  test_cases_passed: number;

  total_test_cases: number;

  execution_time: number | null;

  memory_used: number | null;

  results: TestCaseRunResult[];

  error: string | null;
}


/* =========================================
   SUBMIT CODE API
========================================= */

export const submitCode = async (
  data: SubmissionCreate
): Promise<SubmissionResponse> => {
  const response =
    await api.post<SubmissionResponse>(
      "/submissions",
      data
    );

  return response.data;
};


/* =========================================
   RUN CODE API
========================================= */

export const runCode = async (
  data: RunCodeRequest
): Promise<RunCodeResponse> => {
  const response =
    await api.post<RunCodeResponse>(
      "/submissions/run",
      data
    );

  return response.data;
};


/* =========================================
   GET MY SUBMISSIONS
========================================= */

export const getMySubmissions = async (): Promise<
  SubmissionResponse[]
> => {
  const response =
    await api.get<SubmissionResponse[]>(
      "/submissions"
    );

  return response.data;
};


/* =========================================
   GET SUBMISSION BY ID
========================================= */

export const getSubmissionById = async (
  submissionId: string
): Promise<SubmissionDetailResponse> => {
  const response =
    await api.get<SubmissionDetailResponse>(
      `/submissions/${submissionId}`
    );

  return response.data;
};


/* =========================================
   GET LATEST SUBMISSION FOR PROBLEM
========================================= */

export const getLatestSubmissionForProblem =
  async (
    problemId: number
  ): Promise<SubmissionDetailResponse | null> => {
    const response =
      await api.get<
        SubmissionDetailResponse | null
      >(
        `/submissions/problem/${problemId}/latest`
      );

    return response.data;
  };