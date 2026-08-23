import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./SubmissionsPage.css";

import {
  getMySubmissions,
  type SubmissionResponse,
} from "../api/submissionApi";


function SubmissionsPage() {
  const [submissions, setSubmissions] =
    useState<SubmissionResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================
     FETCH SUBMISSIONS
  ========================================= */

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getMySubmissions();

        setSubmissions(data);

      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail =
            err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else {
            setError(
              "Failed to load submissions."
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

    fetchSubmissions();
  }, []);


  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (
    status: string
  ) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };


  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatExecutionTime = (
    time: number | null
  ) => {
    if (time === null) {
      return "N/A";
    }

    return `${time.toFixed(6)} s`;
  };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="submissions-loading">

        <div className="submissions-loading-spinner" />

        <p>
          Loading submissions...
        </p>

      </div>
    );
  }


  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <div className="submissions-error-page">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <Link
          to="/problems"
          className="submissions-back-link"
        >
          ← Back to Problems
        </Link>

      </div>
    );
  }


  return (
    <div className="submissions-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="submissions-header">

        <div>

          <h1>
            My Submissions
          </h1>

          <p>
            View your previous code
            submissions and results.
          </p>

        </div>


        <Link
          to="/problems"
          className="submissions-back-link"
        >
          ← Problems
        </Link>

      </div>


      {/* =====================================
          EMPTY STATE
      ===================================== */}

      {submissions.length === 0 ? (

        <div className="empty-submissions">

          <div className="empty-submissions-icon">
            ◫
          </div>

          <h2>
            No submissions yet
          </h2>

          <p>
            Start solving problems and your
            submissions will appear here.
          </p>

          <Link
            to="/problems"
            className="empty-submissions-button"
          >
            Browse Problems
          </Link>

        </div>

      ) : (

        <div className="submissions-container">


          {/* =================================
              TABLE HEADER
          ================================= */}

          <div className="submissions-table-header">

            <div>
              Problem
            </div>

            <div>
              Status
            </div>

            <div>
              Language
            </div>

            <div>
              Test Cases
            </div>

            <div>
              Runtime
            </div>

            <div>
              Submitted
            </div>

            <div>
              Action
            </div>

          </div>


          {/* =================================
              SUBMISSION ROWS
          ================================= */}

          <div className="submissions-list">

            {submissions.map(
              (submission) => (

                <div
                  key={
                    submission.submission_id
                  }
                  className="submission-card"
                >


                  {/* PROBLEM */}

                  <div
                    className="submission-cell problem-cell"
                  >

                    <span className="mobile-label">
                      Problem
                    </span>

                    <span className="problem-id">

                      #
                      {submission.problem_id}

                    </span>

                    <span className="problem-name">
                      Problem
                    </span>

                  </div>


                  {/* STATUS */}

                  <div
                    className="submission-cell"
                  >

                    <span className="mobile-label">
                      Status
                    </span>

                    <span
                      className={`
                        submission-status
                        ${getStatusClass(
                          submission.status
                        )}
                      `}
                    >

                      {submission.status}

                    </span>

                  </div>


                  {/* LANGUAGE */}

                  <div
                    className="submission-cell"
                  >

                    <span className="mobile-label">
                      Language
                    </span>

                    <span className="language-badge">

                      {submission.language ===
                      "python"
                        ? "🐍 Python"
                        : submission.language}

                    </span>

                  </div>


                  {/* TEST CASES */}

                  <div
                    className="submission-cell"
                  >

                    <span className="mobile-label">
                      Test Cases
                    </span>

                    <span className="test-case-value">

                      {
                        submission.test_cases_passed
                      }

                      <span>
                        {" / "}
                      </span>

                      {
                        submission.total_test_cases
                      }

                    </span>

                  </div>


                  {/* RUNTIME */}

                  <div
                    className="submission-cell"
                  >

                    <span className="mobile-label">
                      Runtime
                    </span>

                    <span className="runtime-value">

                      {formatExecutionTime(
                        submission.execution_time
                      )}

                    </span>

                  </div>


                  {/* SUBMITTED */}

                  <div
                    className="submission-cell"
                  >

                    <span className="mobile-label">
                      Submitted
                    </span>

                    <span className="submitted-date">

                      {new Date(
                        submission.created_at
                      ).toLocaleString()}

                    </span>

                  </div>


                  {/* ACTION */}

                  <div
                    className="submission-cell action-cell"
                  >

                    <Link
                      to={`/submissions/${submission.submission_id}`}
                      className="view-submission-button"
                    >

                      View →

                    </Link>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}


export default SubmissionsPage;