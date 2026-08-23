import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import {
  verifyOTP,
  resendOTP,
} from "../api/authApi";

function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const handleVerifyOTP = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email information is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "OTP must contain exactly 6 digits."
      );
      return;
    }

    try {
      setLoading(true);

      await verifyOTP({
        email,
        otp,
      });

      navigate("/login", {
        state: {
          message:
            "Account verified successfully. Please log in.",
        },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError(
            "OTP verification failed."
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

  const handleResendOTP = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email information is missing. Please register again."
      );
      return;
    }

    try {
      setResending(true);

      const response = await resendOTP({
        email,
      });

      setMessage(response.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError(
            "Failed to resend OTP."
          );
        }
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-2xl">
            ✉️
          </div>

          <h1 className="text-3xl font-bold text-white">
            Verify your email
          </h1>

          <p className="mt-3 text-slate-400">
            We've sent a 6-digit verification code
            to your email address.
          </p>

          {email && (
            <p className="mt-2 font-medium text-primary">
              {email}
            </p>
          )}
        </div>

        {/* OTP Card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xl">

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          <form
            onSubmit={handleVerifyOTP}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                maxLength={6}
                required
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-border bg-background px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none transition placeholder:tracking-[0.5em] placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="mt-2 text-center text-xs text-slate-500">
                Enter the 6-digit code sent to your email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-sm text-slate-400">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="mt-2 text-sm font-medium text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending
                ? "Sending..."
                : "Resend OTP"}
            </button>
          </div>

          {/* Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already verified?{" "}

              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Go to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTPPage;