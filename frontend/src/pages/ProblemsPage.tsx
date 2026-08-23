import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  getProblems,
  type Difficulty,
  type ProblemSummary,
} from "../api/problemApi";

function ProblemsPage() {
  const [problems, setProblems] = useState<
    ProblemSummary[]
  >([]);

  const [difficulty, setDifficulty] =
    useState<Difficulty | undefined>(undefined);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProblems(
          1,
          20,
          difficulty
        );

        setProblems(data.problems);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else {
            setError("Failed to load problems.");
          }
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [difficulty]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) =>
      problem.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [problems, search]);

  return (
    <div className="problems-page">

      {/* HEADER */}

      <div className="problems-header">
        <div>
          <span className="page-eyebrow">
            PROBLEM LIBRARY
          </span>

          <h1>Problems</h1>

          <p>
            Practice coding problems and prepare for
            technical interviews.
          </p>
        </div>

        <div className="problem-count">
          {filteredProblems.length} Problems
        </div>
      </div>


      {/* FILTER SECTION */}

      <div className="problems-toolbar">

        <div className="search-container">
          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>


        <div className="difficulty-filters">

          <button
            className={
              difficulty === undefined
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setDifficulty(undefined)
            }
          >
            All
          </button>

          <button
            className={
              difficulty === "Easy"
                ? "filter-button easy active"
                : "filter-button easy"
            }
            onClick={() =>
              setDifficulty("Easy")
            }
          >
            Easy
          </button>

          <button
            className={
              difficulty === "Medium"
                ? "filter-button medium active"
                : "filter-button medium"
            }
            onClick={() =>
              setDifficulty("Medium")
            }
          >
            Medium
          </button>

          <button
            className={
              difficulty === "Hard"
                ? "filter-button hard active"
                : "filter-button hard"
            }
            onClick={() =>
              setDifficulty("Hard")
            }
          >
            Hard
          </button>

        </div>
      </div>


      {/* CONTENT */}

      {loading ? (
        <div className="problems-state">
          Loading problems...
        </div>
      ) : error ? (
        <div className="problems-state error">
          {error}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="problems-state">
          No problems found.
        </div>
      ) : (
        <div className="problems-card">

          {/* TABLE HEADER */}

          <div className="problems-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span>Topics</span>
            <span></span>
          </div>


          {/* PROBLEMS */}

          {filteredProblems.map((problem) => (
            <div
              className="problem-row"
              key={problem.problem_id}
            >
              <span className="problem-number">
                {problem.problem_id}
              </span>

              <Link
                to={`/problems/${problem.problem_id}`}
                className="problem-title"
              >
                {problem.title}
              </Link>

              <span
                className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}
              >
                {problem.difficulty}
              </span>

              <div className="problem-topics">
                {problem.topics.map((topic) => (
                  <span
                    key={topic}
                    className="topic-badge"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <Link
                to={`/problems/${problem.problem_id}`}
                className="solve-link"
              >
                Solve →
              </Link>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default ProblemsPage;