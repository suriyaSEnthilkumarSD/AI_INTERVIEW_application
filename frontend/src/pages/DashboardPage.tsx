import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  getDashboard,
  type DashboardResponse,
} from "../api/dashboardApi";


function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboard();

        setDashboard(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail =
            err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else {
            setError(
              "Failed to load dashboard."
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

    fetchDashboard();
  }, []);


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400">
          Loading dashboard...
        </p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="text-lg font-semibold text-red-400">
            {error}
          </h2>
        </div>
      </div>
    );
  }


  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400">
          No dashboard data available.
        </p>
      </div>
    );
  }


  const {
    overall,
    difficulty_stats,
    acceptance,
    recent_submissions,
  } = dashboard;


  const solvedPercentage =
    overall.total_problems > 0
      ? Math.round(
          (overall.solved_problems /
            overall.total_problems) *
            100
        )
      : 0;


  const getDifficultyColor = (
    difficulty: string
  ) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-500";

      case "medium":
        return "bg-yellow-500";

      case "hard":
        return "bg-red-500";

      default:
        return "bg-blue-500";
    }
  };


  const getDifficultyTextColor = (
    difficulty: string
  ) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-emerald-400";

      case "medium":
        return "text-yellow-400";

      case "hard":
        return "text-red-400";

      default:
        return "text-blue-400";
    }
  };


  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">


      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="mb-2 text-sm font-medium text-blue-400">
            INTERVIEW PREPARATION
          </p>

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Track your progress and keep improving
            your problem-solving skills.
          </p>
        </div>


        <Link
          to="/problems"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          Solve Problems →
        </Link>

      </div>


      {/* Overview Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


        {/* Total Problems */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Total Problems
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {overall.total_problems}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Available to practice
          </p>

        </div>


        {/* Solved */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Solved
          </p>

          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {overall.solved_problems}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {solvedPercentage}% completed
          </p>

        </div>


        {/* Attempted */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Attempted
          </p>

          <p className="mt-3 text-3xl font-bold text-yellow-400">
            {overall.attempted_problems}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Problems you have tried
          </p>

        </div>


        {/* Acceptance Rate */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Acceptance Rate
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-400">
            {acceptance.acceptance_rate}%
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {acceptance.accepted_attempts} accepted
          </p>

        </div>

      </div>


      {/* Progress + Acceptance */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">


        {/* Problem Progress */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-white">
                Problem Progress
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your progress across all problems
              </p>
            </div>

            <span className="text-sm font-medium text-blue-400">
              {solvedPercentage}%
            </span>

          </div>


          {/* Overall Progress */}

          <div className="mb-7">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-slate-400">
                Overall progress
              </span>

              <span className="text-slate-300">
                {overall.solved_problems} /{" "}
                {overall.total_problems}
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${solvedPercentage}%`,
                }}
              />

            </div>

          </div>


          {/* Difficulty Progress */}

          <div className="space-y-6">

            {difficulty_stats.map((stat) => {

              const percentage =
                stat.total > 0
                  ? Math.round(
                      (stat.solved /
                        stat.total) *
                        100
                    )
                  : 0;


              return (
                <div
                  key={stat.difficulty}
                >

                  <div className="mb-2 flex justify-between text-sm">

                    <div className="flex items-center gap-2">

                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getDifficultyColor(
                          stat.difficulty
                        )}`}
                      />

                      <span
                        className={`font-medium ${getDifficultyTextColor(
                          stat.difficulty
                        )}`}
                      >
                        {stat.difficulty}
                      </span>

                    </div>


                    <span className="text-slate-400">
                      {stat.solved} /{" "}
                      {stat.total}
                    </span>

                  </div>


                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className={`h-full rounded-full ${getDifficultyColor(
                        stat.difficulty
                      )}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* Acceptance Statistics */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-white">
              Acceptance Statistics
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Overview of your submissions
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4">


            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Total Attempts
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {acceptance.total_attempts}
              </p>

            </div>


            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Accepted
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {acceptance.accepted_attempts}
              </p>

            </div>


            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Failed
              </p>

              <p className="mt-2 text-3xl font-bold text-red-400">
                {acceptance.failed_attempts}
              </p>

            </div>


            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                Not Attempted
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-300">
                {overall.not_attempted_problems}
              </p>

            </div>

          </div>


          {/* Acceptance Bar */}

          <div className="mt-8">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-slate-400">
                Acceptance rate
              </span>

              <span className="font-medium text-blue-400">
                {acceptance.acceptance_rate}%
              </span>

            </div>


            <div className="h-3 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.min(
                    acceptance.acceptance_rate,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>


      {/* Recent Submissions */}

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">

        <div className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Recent Submissions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your latest coding attempts
            </p>

          </div>


          <Link
            to="/submissions"
            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          >
            View all →
          </Link>

        </div>


        {recent_submissions.length === 0 ? (

          <div className="p-10 text-center">

            <p className="text-lg font-medium text-slate-300">
              No submissions yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Start solving problems to see your
              progress here.
            </p>


            <Link
              to="/problems"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              Browse Problems
            </Link>

          </div>

        ) : (

          <div className="divide-y divide-slate-800">

            {recent_submissions.map(
              (submission) => {

                const isAccepted =
                  submission.status.toLowerCase() ===
                  "accepted";


                return (

                  <Link
                    key={
                      submission.submission_id
                    }
                    to={`/submissions/${submission.submission_id}`}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div>

                      <h3 className="font-medium text-white">

                        {submission.problem_id}.{" "}

                        {
                          submission.problem_title
                        }

                      </h3>


                      <p className="mt-1 text-sm text-slate-500">

                        {submission.language} •{" "}

                        {new Date(
                          submission.created_at
                        ).toLocaleString()}

                      </p>

                    </div>


                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                        isAccepted
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >

                      {
                        submission.status
                      }

                    </span>

                  </Link>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}


export default DashboardPage;