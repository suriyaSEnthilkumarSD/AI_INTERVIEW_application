import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";

import "./ProblemDetailPage.css";

import {
  getProblemById,
  type ProblemDetail,
  type TestCase,
} from "../api/problemApi";

import {
  getMySubmissions,
  getSubmissionById,
  runCode,
  submitCode,
  type Language,
  type RunCodeResponse,
  type SubmissionResponse,
} from "../api/submissionApi";


function ProblemDetailPage() {
  const { problemId } = useParams();

  const [problem, setProblem] =
    useState<ProblemDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [language, setLanguage] =
    useState<Language>("python");

  const [sourceCode, setSourceCode] =
    useState("");

  const [running, setRunning] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submissionError, setSubmissionError] =
    useState("");

  const [runResult, setRunResult] =
    useState<RunCodeResponse | null>(null);

  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResponse | null>(null);


  /* =========================================
     FETCH PROBLEM
  ========================================= */

  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemId) {
        setError("Problem ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const numericProblemId =
          Number(problemId);

        const problemData =
          await getProblemById(
            numericProblemId
          );

        setProblem(problemData);

        setLanguage("python");

        const submissions =
          await getMySubmissions();

        const previousSubmission =
          submissions.find(
            (submission) =>
              submission.problem_id ===
                numericProblemId &&
              submission.language === "python"
          );

        if (previousSubmission) {
          const submissionDetails =
            await getSubmissionById(
              previousSubmission.submission_id
            );

          setSourceCode(
            submissionDetails.source_code
          );
        } else {
          setSourceCode(
            problemData.code.starterCode.python
          );
        }

      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail =
            err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else {
            setError(
              "Failed to load problem."
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

    fetchProblem();
  }, [problemId]);


  /* =========================================
     LANGUAGE CHANGE
  ========================================= */

  const handleLanguageChange = (
    selectedLanguage: Language
  ) => {
    if (!problem) return;

    setLanguage(selectedLanguage);

    setSubmissionError("");
    setRunResult(null);
    setSubmissionResult(null);

    if (selectedLanguage === "python") {
      setSourceCode(
        problem.code.starterCode.python
      );
    }

    if (selectedLanguage === "cpp") {
      setSourceCode(
        problem.code.starterCode.cpp
      );
    }

    if (selectedLanguage === "java") {
      setSourceCode(
        problem.code.starterCode.java
      );
    }
  };


  /* =========================================
     RUN CODE
  ========================================= */

  const handleRunCode = async () => {
    if (!problem) return;

    if (language !== "python") {
      setSubmissionError(
        `${language === "cpp"
          ? "C++"
          : "Java"
        } execution is currently under development.`
      );

      return;
    }

    if (!sourceCode.trim()) {
      setSubmissionError(
        "Please write some code before running."
      );

      return;
    }

    try {
      setRunning(true);

      setSubmissionError("");
      setRunResult(null);
      setSubmissionResult(null);

      const result =
        await runCode({
          problem_id:
            problem.problem_id,

          language,

          source_code:
            sourceCode,
        });

      setRunResult(result);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setSubmissionError(detail);
        } else {
          setSubmissionError(
            "Failed to run code."
          );
        }
      } else {
        setSubmissionError(
          "Something went wrong while running code."
        );
      }
    } finally {
      setRunning(false);
    }
  };


  /* =========================================
     SUBMIT CODE
  ========================================= */

  const handleSubmitCode = async () => {
    if (!problem) return;

    if (language !== "python") {
      setSubmissionError(
        `${language === "cpp"
          ? "C++"
          : "Java"
        } execution is currently under development.`
      );

      return;
    }

    if (!sourceCode.trim()) {
      setSubmissionError(
        "Please write some code before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);

      setSubmissionError("");
      setRunResult(null);
      setSubmissionResult(null);

      const result =
        await submitCode({
          problem_id:
            problem.problem_id,

          language,

          source_code:
            sourceCode,
        });

      setSubmissionResult(result);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setSubmissionError(detail);
        } else {
          setSubmissionError(
            "Failed to submit code."
          );
        }
      } else {
        setSubmissionError(
          "Something went wrong while submitting."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };


  /* =========================================
     FORMAT VALUE
  ========================================= */

  const formatValue = (
    value: unknown
  ): string => {
    if (typeof value === "string") {
      return value;
    }

    if (value === undefined) {
      return "undefined";
    }

    if (value === null) {
      return "null";
    }

    return JSON.stringify(
      value,
      null,
      2
    );
  };


  /* =========================================
     GET PUBLIC TEST CASES
  ========================================= */

  const getPublicTestCases =
    (): TestCase[] => {
      if (!problem) return [];

      return problem.evaluation.testCases.filter(
        (testCase) =>
          testCase.visibility === "public"
      );
    };


  /* =========================================
     GET MONACO LANGUAGE
  ========================================= */

  const getMonacoLanguage = () => {
    if (language === "python") {
      return "python";
    }

    if (language === "cpp") {
      return "cpp";
    }

    if (language === "java") {
      return "java";
    }

    return "plaintext";
  };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="problem-loading">

        <div className="loading-spinner" />

        <p>
          Loading problem...
        </p>

      </div>
    );
  }


  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <div className="problem-error-page">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <Link
          to="/problems"
          className="back-button"
        >
          ← Back to Problems
        </Link>

      </div>
    );
  }


  if (!problem) {
    return (
      <div className="problem-error-page">

        <h2>
          Problem not found
        </h2>

        <Link
          to="/problems"
          className="back-button"
        >
          ← Back to Problems
        </Link>

      </div>
    );
  }


  const isLanguageAvailable =
    language === "python";

  const publicTestCases =
    getPublicTestCases();


  return (
    <div className="problem-workspace">


      {/* =========================================
          TOP HEADER
      ========================================= */}

      <div className="problem-workspace-header">

        <Link
          to="/problems"
          className="problem-back-link"
        >
          ← Back to Problems
        </Link>


        <div className="problem-title-row">

          <h1>
            {problem.problem_id}.
            {" "}
            {problem.title}
          </h1>


          <div className="problem-meta">

            <span
              className={`
                difficulty-badge
                difficulty-${problem.difficulty.toLowerCase()}
              `}
            >
              {problem.difficulty}
            </span>


            <div className="topic-list">

              {problem.topics.map(
                (topic) => (
                  <span
                    key={topic}
                    className="topic-tag"
                  >
                    {topic}
                  </span>
                )
              )}

            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          MAIN WORKSPACE
      ========================================= */}

      <div className="problem-layout">


        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <section className="problem-description-panel">


          <div className="problem-section">

            <h2>
              📋 Description
            </h2>

            <p className="problem-description-text">
              {problem.content.description}
            </p>

          </div>


          <div className="problem-section">

            <h2>
              ⚙️ Constraints
            </h2>

            <ul className="constraints-list">

              {problem.content.constraints.map(
                (
                  constraint,
                  index
                ) => (
                  <li key={index}>
                    {constraint}
                  </li>
                )
              )}

            </ul>

          </div>


          {publicTestCases.length > 0 && (

            <div className="problem-section">

              <h2>
                🧪 Examples
              </h2>


              {publicTestCases.map(
                (
                  testCase,
                  index
                ) => (

                  <div
                    key={testCase.id}
                    className="example-card"
                  >

                    <h3>
                      Example {index + 1}
                    </h3>


                    <div className="example-row">

                      <span>
                        Input
                      </span>

                      <pre>
                        {formatValue(
                          testCase.input
                        )}
                      </pre>

                    </div>


                    <div className="example-row">

                      <span>
                        Output
                      </span>

                      <pre>
                        {formatValue(
                          testCase.expectedOutput
                        )}
                      </pre>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


          <div className="problem-section">

            <h2>
              📥 Input
            </h2>

            <div className="problem-info-box">

              {problem.content.inputDescription}

            </div>

          </div>


          <div className="problem-section">

            <h2>
              📤 Output
            </h2>

            <div className="problem-info-box">

              {problem.content.outputDescription}

            </div>

          </div>


          <div className="problem-section hints-section">

            <h2>
              💡 Hints
            </h2>


            {problem.content.hints.length === 0 ? (

              <p className="empty-hints">
                No hints available for this problem.
              </p>

            ) : (

              problem.content.hints.map(
                (hint) => (

                  <details
                    key={hint.level}
                    className="hint-card"
                  >

                    <summary>

                      <span>
                        Hint {hint.level}
                      </span>

                      <span>
                        ⌄
                      </span>

                    </summary>


                    <p>
                      {hint.text}
                    </p>

                  </details>

                )
              )

            )}

          </div>

        </section>


        {/* =========================================
            RIGHT SIDE
        ========================================= */}

        <section className="right-workspace">


          <div className="editor-panel">


            <div className="editor-header">

              <div className="editor-title">

                <span className="editor-status-dot" />

                <span>
                  Code Editor
                </span>

              </div>


              <select
                value={language}
                onChange={(event) =>
                  handleLanguageChange(
                    event.target.value as Language
                  )
                }
                className="language-select"
              >

                <option value="python">
                  🐍 Python
                </option>

                <option value="cpp">
                  C++ (Coming Soon)
                </option>

                <option value="java">
                  Java (Coming Soon)
                </option>

              </select>

            </div>


            {!isLanguageAvailable && (

              <div className="language-coming-soon">

                <div>
                  🚧
                </div>

                <strong>
                  {language === "cpp"
                    ? "C++ execution is coming soon"
                    : "Java execution is coming soon"}
                </strong>

              </div>

            )}


            {/* MONACO EDITOR */}

            <div className="code-editor-wrapper">

              <Editor
                height="100%"
                language={getMonacoLanguage()}
                value={sourceCode}
                onChange={(value) =>
                  setSourceCode(
                    value ?? ""
                  )
                }
                theme="vs-dark"
                options={{
                  readOnly:
                    !isLanguageAvailable,

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

                  insertSpaces: true,

                  detectIndentation: true,

                  formatOnPaste: true,

                  formatOnType: true,

                  autoClosingBrackets:
                    "always",

                  autoClosingQuotes:
                    "always",

                  lineNumbers:
                    "on",

                  roundedSelection:
                    true,

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


            {/* EDITOR STATUS */}

            <div className="editor-status-bar">

              <span>

                {isLanguageAvailable
                  ? "● Python environment ready"
                  : "🚧 Environment unavailable"}

              </span>

              <span>
                Spaces: 4
              </span>

              <span>
                UTF-8
              </span>

            </div>


            {/* ACTION BUTTONS */}

            <div className="editor-actions">


              {/* RUN CODE */}

              <button
                type="button"
                onClick={handleRunCode}
                className="run-code-button"
                disabled={
                  running ||
                  submitting ||
                  !isLanguageAvailable
                }
              >

                {running
                  ? "Running..."
                  : "▶ Run Code"}

              </button>


              {/* SUBMIT CODE */}

              <button
                onClick={
                  handleSubmitCode
                }
                disabled={
                  running ||
                  submitting ||
                  !isLanguageAvailable
                }
                className="submit-code-button"
              >

                {submitting
                  ? "Submitting..."
                  : !isLanguageAvailable
                  ? "Coming Soon"
                  : "🚀 Submit Code"}

              </button>

            </div>

          </div>


          {/* =====================================
              ERROR
          ===================================== */}

          {submissionError && (

            <div className="submission-error">

              <strong>
                Execution Error
              </strong>

              <p>
                {submissionError}
              </p>

            </div>

          )}


          {/* =====================================
              OUTPUT PANEL
          ===================================== */}

          <div className="output-panel">


            <div className="output-header">

              <h2>
                ▣ Output / Test Results
              </h2>

            </div>


            {/* =====================================
                EMPTY OUTPUT
            ===================================== */}

            {!runResult &&
              !submissionResult && (

              <div className="empty-output">

                <div className="output-icon">
                  ▷_
                </div>

                <p>
                  Run or submit your code
                  <br />
                  to see results here.
                </p>

              </div>

            )}


            {/* =====================================
                RUN RESULT
            ===================================== */}

            {runResult && (

              <div className="submission-result">


                <div className="submission-result-header">

                  <h3>
                    Run Result
                  </h3>


                  <span
                    className={`
                      submission-status
                      ${runResult.status.toLowerCase()}
                    `}
                  >

                    {runResult.status}

                  </span>

                </div>


                <div className="submission-stats-grid">


                  <div className="submission-stat">

                    <span>
                      Test Cases
                    </span>

                    <strong>

                      {
                        runResult.test_cases_passed
                      }

                      {" / "}

                      {
                        runResult.total_test_cases
                      }

                    </strong>

                  </div>


                  <div className="submission-stat">

                    <span>
                      Execution Time
                    </span>

                    <strong>

                      {
                        runResult.execution_time ??
                        "N/A"
                      }

                    </strong>

                  </div>


                  <div className="submission-stat">

                    <span>
                      Memory Used
                    </span>

                    <strong>

                      {
                        runResult.memory_used ??
                        "N/A"
                      }

                    </strong>

                  </div>

                </div>


                {/* INDIVIDUAL TEST CASE RESULTS */}

                {runResult.results.length > 0 && (

                  <div className="run-test-results">

                    <h3>
                      Test Case Results
                    </h3>


                    {runResult.results.map(
                      (
                        result,
                        index
                      ) => (

                        <div
                          key={
                            result.test_case_id
                          }
                          className={
                            `run-test-case ${
                              result.passed
                                ? "passed"
                                : "failed"
                            }`
                          }
                        >

                          <div className="run-test-case-header">

                            <strong>

                              Test Case{" "}

                              {index + 1}

                            </strong>


                            <span>

                              {result.passed
                                ? "✓ Passed"
                                : "✗ Failed"}

                            </span>

                          </div>


                          {result.error && (

                            <pre className="test-case-error">

                              {result.error}

                            </pre>

                          )}


                          {!result.error && (

                            <>

                              <div className="test-case-value">

                                <span>
                                  Your Output
                                </span>

                                <pre>

                                  {formatValue(
                                    result.actual_output
                                  )}

                                </pre>

                              </div>


                              <div className="test-case-value">

                                <span>
                                  Expected Output
                                </span>

                                <pre>

                                  {formatValue(
                                    result.expected_output
                                  )}

                                </pre>

                              </div>

                            </>

                          )}

                        </div>

                      )
                    )}

                  </div>

                )}


                {runResult.error && (

                  <div className="submission-runtime-error">

                    <strong>
                      Error
                    </strong>

                    <pre>
                      {runResult.error}
                    </pre>

                  </div>

                )}

              </div>

            )}


            {/* =====================================
                SUBMISSION RESULT
            ===================================== */}

            {submissionResult && (

              <div className="submission-result">


                <div className="submission-result-header">

                  <h3>
                    Submission Result
                  </h3>


                  <span
                    className={`
                      submission-status
                      ${submissionResult.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}
                    `}
                  >

                    {submissionResult.status}

                  </span>

                </div>


                <div className="submission-stats-grid">


                  <div className="submission-stat">

                    <span>
                      Test Cases
                    </span>

                    <strong>

                      {
                        submissionResult.test_cases_passed
                      }

                      {" / "}

                      {
                        submissionResult.total_test_cases
                      }

                    </strong>

                  </div>


                  <div className="submission-stat">

                    <span>
                      Execution Time
                    </span>

                    <strong>

                      {
                        submissionResult.execution_time ??
                        "N/A"
                      }

                    </strong>

                  </div>


                  <div className="submission-stat">

                    <span>
                      Memory Used
                    </span>

                    <strong>

                      {
                        submissionResult.memory_used ??
                        "N/A"
                      }

                    </strong>

                  </div>

                </div>


                <div className="submission-id">

                  Submission ID:{" "}

                  <code>
                    {
                      submissionResult.submission_id
                    }
                  </code>

                </div>


                {submissionResult.error && (

                  <div className="submission-runtime-error">

                    <strong>
                      Error
                    </strong>

                    <pre>
                      {
                        submissionResult.error
                      }
                    </pre>

                  </div>

                )}

              </div>

            )}

          </div>

        </section>

      </div>

    </div>
  );
}


export default ProblemDetailPage;