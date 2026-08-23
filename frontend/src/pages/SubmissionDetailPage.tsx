import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";

import "./SubmissionDetailPage.css";

import {
  getSubmissionById,
  type SubmissionDetailResponse,
  type SubmissionStatus,
} from "../api/submissionApi";

import {
  analyzeSubmission,
  type AIAnalysisMode,
  type AIAnalysisResponse,
} from "../api/aiApi";


function SubmissionDetailPage() {
  const { submissionId } = useParams();

  const [submission, setSubmission] =
    useState<SubmissionDetailResponse | null>(
      null
    );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // AI ANALYSIS STATE
  // =========================================

  const [aiResponse, setAiResponse] =
    useState<AIAnalysisResponse | null>(
      null
    );

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiError, setAiError] =
    useState("");

  const [selectedMode, setSelectedMode] =
    useState<AIAnalysisMode | null>(
      null
    );


  // =========================================
  // FETCH SUBMISSION
  // =========================================

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) {
        setError("Submission ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getSubmissionById(
            submissionId
          );

        setSubmission(data);

      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail =
            err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else {
            setError(
              "Failed to load submission."
            );
          }
        } else {
          setError(
            "Something went wrong."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);


  // =========================================
  // AI ANALYSIS
  // =========================================

  const handleAIAnalysis = async (
    mode: AIAnalysisMode
  ) => {
    if (!submissionId) {
      return;
    }

    try {
      setAiLoading(true);

      setAiError("");

      setAiResponse(null);

      setSelectedMode(mode);

      const data =
        await analyzeSubmission({
          submission_id: submissionId,
          mode,
        });

      setAiResponse(data);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setAiError(detail);
        } else {
          setAiError(
            "Failed to get AI analysis."
          );
        }
      } else {
        setAiError(
          "Something went wrong while analyzing the code."
        );
      }
    } finally {
      setAiLoading(false);
    }
  };


  // =========================================
  // GET STATUS CLASS
  // =========================================

  const getStatusClass = (
    status: SubmissionStatus
  ) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };


  // =========================================
  // GET MONACO LANGUAGE
  // =========================================

  const getMonacoLanguage = () => {
    if (!submission) {
      return "plaintext";
    }

    if (submission.language === "python") {
      return "python";
    }

    if (submission.language === "cpp") {
      return "cpp";
    }

    if (submission.language === "java") {
      return "java";
    }

    return "plaintext";
  };


  // =========================================
  // FORMAT LANGUAGE
  // =========================================

  const formatLanguage = (
    language: string
  ) => {
    if (language === "python") {
      return "🐍 Python";
    }

    if (language === "cpp") {
      return "C++";
    }

    if (language === "java") {
      return "Java";
    }

    return language;
  };


  // =========================================
  // FORMAT AI MODE
  // =========================================

  const getModeLabel = (
    mode: AIAnalysisMode
  ) => {
    switch (mode) {
      case "hint":
        return "Get Hint";

      case "analysis":
        return "Analyze Code";

      case "optimization":
        return "Optimize Code";

      case "explain":
        return "Explain Code";

      default:
        return "Analyze";
    }
  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="submission-detail-loading">

        <div className="loading-spinner" />

        <p>
          Loading submission...
        </p>

      </div>
    );
  }


  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="submission-detail-error-page">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <Link
          to="/submissions"
          className="submission-detail-back-button"
        >
          ← Back to Submissions
        </Link>

      </div>
    );
  }


  if (!submission) {
    return (
      <div className="submission-detail-error-page">

        <h2>
          Submission not found
        </h2>

        <Link
          to="/submissions"
          className="submission-detail-back-button"
        >
          ← Back to Submissions
        </Link>

      </div>
    );
  }


  return (
    <div className="submission-detail-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="submission-detail-header">

        <Link
          to="/submissions"
          className="submission-detail-back-link"
        >
          ← Back to Submissions
        </Link>


        <div className="submission-detail-title-row">

          <div>

            <h1>
              Submission Details
            </h1>

            <p>
              Review your submission,
              execution results, and AI feedback.
            </p>

          </div>


          <span
            className={`
              submission-detail-status
              ${getStatusClass(
                submission.status
              )}
            `}
          >
            {submission.status}
          </span>

        </div>

      </div>


      {/* =====================================
          RESULT OVERVIEW
      ===================================== */}

      <section className="submission-overview-card">

        <div className="submission-overview-main">

          <div className="submission-problem-icon">
            &lt;/&gt;
          </div>


          <div className="submission-problem-info">

            <span>
              PROBLEM
            </span>

            <h2>
              Problem #{submission.problem_id}
            </h2>

            <p>
              {formatLanguage(
                submission.language
              )}
            </p>

          </div>

        </div>


        <div className="submission-date-info">

          <span>
            Submitted
          </span>

          <strong>
            {new Date(
              submission.created_at
            ).toLocaleString()}
          </strong>

        </div>

      </section>


      {/* =====================================
          PERFORMANCE STATS
      ===================================== */}

      <section className="submission-performance-grid">


        <div className="performance-card">

          <span className="performance-label">
            TEST CASES
          </span>

          <strong>
            {submission.test_cases_passed}

            <span>
              {" / "}
              {submission.total_test_cases}
            </span>

          </strong>

        </div>


        <div className="performance-card">

          <span className="performance-label">
            EXECUTION TIME
          </span>

          <strong>

            {submission.execution_time !== null
              ? `${submission.execution_time} s`
              : "N/A"}

          </strong>

        </div>


        <div className="performance-card">

          <span className="performance-label">
            MEMORY USED
          </span>

          <strong>

            {submission.memory_used !== null
              ? `${submission.memory_used} MB`
              : "N/A"}

          </strong>

        </div>

      </section>


      {/* =====================================
          SUBMISSION INFORMATION
      ===================================== */}

      <section className="submission-info-card">

        <h2>
          Submission Information
        </h2>


        <div className="submission-info-grid">

          <div>

            <span>
              Submission ID
            </span>

            <code>
              {submission.submission_id}
            </code>

          </div>


          <div>

            <span>
              Language
            </span>

            <strong>
              {formatLanguage(
                submission.language
              )}
            </strong>

          </div>


          <div>

            <span>
              Submitted At
            </span>

            <strong>
              {new Date(
                submission.created_at
              ).toLocaleString()}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================
          EXECUTION ERROR
      ===================================== */}

      {submission.error && (

        <section className="submission-detail-runtime-error">

          <div className="runtime-error-header">

            <span>
              ⚠
            </span>

            <div>

              <h2>
                Execution Error
              </h2>

              <p>
                Your code encountered an error
                during execution.
              </p>

            </div>

          </div>


          <pre>
            {submission.error}
          </pre>

        </section>

      )}


      {/* =====================================
          SUBMITTED CODE
      ===================================== */}

      <section className="submitted-code-card">


        <div className="submitted-code-header">

          <div>

            <h2>
              Submitted Code
            </h2>

            <p>
              {formatLanguage(
                submission.language
              )}
            </p>

          </div>


          <span className="readonly-badge">
            🔒 Read Only
          </span>

        </div>


        <div className="submitted-code-editor">

          <Editor
            height="100%"
            language={getMonacoLanguage()}
            value={submission.source_code}
            theme="vs-dark"
            options={{
              readOnly: true,

              fontSize: 15,

              fontFamily:
                "'Fira Code', 'Cascadia Code', Consolas, monospace",

              minimap: {
                enabled: false,
              },

              automaticLayout: true,

              scrollBeyondLastLine: false,

              wordWrap: "on",

              tabSize: 4,

              lineNumbers: "on",

              roundedSelection: true,

              padding: {
                top: 16,
                bottom: 16,
              },

              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />

        </div>

      </section>


      {/* =====================================
          AI CODE ASSISTANT
      ===================================== */}

      <section className="ai-assistant-card">


        <div className="ai-assistant-header">

          <div>

            <h2>
              🤖 AI Code Assistant
            </h2>

            <p>
              Get personalized feedback and
              insights about your submitted code.
            </p>

          </div>

        </div>


        {/* AI ACTIONS */}

        <div className="ai-action-grid">

          <button
            onClick={() =>
              handleAIAnalysis("hint")
            }
            disabled={aiLoading}
            className={`
              ai-action-button
              ${selectedMode === "hint"
                ? "active"
                : ""}
            `}
          >
            <span>
              💡
            </span>

            <div>

              <strong>
                Get Hint
              </strong>

              <small>
                Get guidance without the answer
              </small>

            </div>

          </button>


          <button
            onClick={() =>
              handleAIAnalysis("analysis")
            }
            disabled={aiLoading}
            className={`
              ai-action-button
              ${selectedMode === "analysis"
                ? "active"
                : ""}
            `}
          >
            <span>
              🔍
            </span>

            <div>

              <strong>
                Analyze Code
              </strong>

              <small>
                Find issues and improvements
              </small>

            </div>

          </button>


          <button
            onClick={() =>
              handleAIAnalysis("optimization")
            }
            disabled={aiLoading}
            className={`
              ai-action-button
              ${selectedMode === "optimization"
                ? "active"
                : ""}
            `}
          >
            <span>
              ⚡
            </span>

            <div>

              <strong>
                Optimize Code
              </strong>

              <small>
                Improve performance
              </small>

            </div>

          </button>


          <button
            onClick={() =>
              handleAIAnalysis("explain")
            }
            disabled={aiLoading}
            className={`
              ai-action-button
              ${selectedMode === "explain"
                ? "active"
                : ""}
            `}
          >
            <span>
              📖
            </span>

            <div>

              <strong>
                Explain Code
              </strong>

              <small>
                Understand your solution
              </small>

            </div>

          </button>

        </div>


        {/* AI LOADING */}

        {aiLoading && (

          <div className="ai-loading">

            <div className="loading-spinner" />

            <div>

              <strong>
                🤖 AI is analyzing your code...
              </strong>

              {selectedMode && (
                <p>
                  {getModeLabel(selectedMode)}
                  {" "}in progress.
                </p>
              )}

            </div>

          </div>

        )}


        {/* AI ERROR */}

        {aiError && (

          <div className="ai-error">

            <strong>
              AI Analysis Error
            </strong>

            <p>
              {aiError}
            </p>

          </div>

        )}


        {/* =====================================
            AI RESPONSE
        ===================================== */}

        {aiResponse && !aiLoading && (

          <div className="ai-response">


            <div className="ai-response-header">

              <div>

                <span>
                  AI ANALYSIS
                </span>

                <h3>
                  {selectedMode
                    ? getModeLabel(selectedMode)
                    : "Analysis Result"}
                </h3>

              </div>

              <span className="ai-complete-badge">
                ✨ Complete
              </span>

            </div>


            {/* SUMMARY */}

            <div className="ai-analysis-section">

              <h3>
                Summary
              </h3>

              <p>
                {aiResponse.summary}
              </p>

            </div>


            {/* ISSUE */}

            {aiResponse.issue && (

              <div className="ai-analysis-section ai-issue-section">

                <h3>
                  ⚠ Issue
                </h3>

                <p>
                  {aiResponse.issue}
                </p>

              </div>

            )}


            {/* HINT */}

            {aiResponse.hint && (

              <div className="ai-analysis-section ai-hint-section">

                <h3>
                  💡 Hint
                </h3>

                <p>
                  {aiResponse.hint}
                </p>

              </div>

            )}


            {/* EDGE CASES */}

            {aiResponse.edge_cases.length > 0 && (

              <div className="ai-analysis-section">

                <h3>
                  Edge Cases to Consider
                </h3>

                <ul className="edge-case-list">

                  {aiResponse.edge_cases.map(
                    (edgeCase, index) => (

                      <li key={index}>
                        {edgeCase}
                      </li>

                    )
                  )}

                </ul>

              </div>

            )}


            {/* COMPLEXITY */}

            <div className="ai-analysis-section">

              <h3>
                Complexity Analysis
              </h3>


              <div className="complexity-grid">

                <div>

                  <span>
                    Current Time
                  </span>

                  <strong>
                    {aiResponse.complexity_analysis
                      .current_time ?? "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    Current Space
                  </span>

                  <strong>
                    {aiResponse.complexity_analysis
                      .current_space ?? "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    Expected Time
                  </span>

                  <strong>
                    {aiResponse.complexity_analysis
                      .expected_time ?? "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    Expected Space
                  </span>

                  <strong>
                    {aiResponse.complexity_analysis
                      .expected_space ?? "N/A"}
                  </strong>

                </div>

              </div>

            </div>


            {/* SUGGESTED IMPROVEMENT */}

            {aiResponse.suggested_improvement && (

              <div className="ai-analysis-section suggested-improvement">

                <h3>
                  🚀 Suggested Improvement
                </h3>

                <p>
                  {
                    aiResponse.suggested_improvement
                  }
                </p>

              </div>

            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default SubmissionDetailPage;