import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");

  const [message] = useState(
    location.state?.message || ""
  );

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      await login({
        email,
        password,
      });

      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError(
            "Invalid email or password."
          );
        }
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-background
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-xl
          border
          border-border
          bg-surface
          p-8
          shadow-2xl
        "
      >
        <div className="mb-8">
          <h1
            className="
              text-3xl
              font-bold
              text-white
            "
          >
            Welcome back
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Log in to continue your interview
            preparation.
          </p>
        </div>

        {message && (
          <div
            className="
              mb-4
              rounded-lg
              border
              border-green-500/30
              bg-green-500/10
              p-3
              text-sm
              text-green-400
            "
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="
              mb-4
              rounded-lg
              border
              border-red-500/30
              bg-red-500/10
              p-3
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-300
              "
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
              className="
                w-full
                rounded-lg
                border
                border-border
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-300
              "
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              className="
                w-full
                rounded-lg
                border
                border-border
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-lg
              bg-primary
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>
        </form>

        <p
          className="
            mt-6
            text-center
            text-sm
            text-slate-400
          "
        >
          Don't have an account?{" "}

          <Link
            to="/register"
            className="
              font-medium
              text-primary
              hover:underline
            "
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;