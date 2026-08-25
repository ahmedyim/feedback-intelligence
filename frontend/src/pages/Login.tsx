import { useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import axios from "axios";

interface LoginProps {
  onLogin: (email: string) => void;
  onForgotPassword: () => void;
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function Login({ onLogin, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setError("Enter both email and password.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/auth/login", {
        email: trimmedEmail,
        password,
      });
      onLogin(trimmedEmail);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else if (err.response?.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <rect width="32" height="32" rx="8" fill="var(--brand-deep)" />
            <path d="M9 23V9h14v3.4H12.6v5.2H21v3.4h-8.4V23H9z" fill="var(--brand-glow)" />
          </svg>
          <span>fineto</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to view your feedback intelligence dashboard.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
              disabled={submitting}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button
            type="button"
            className="auth-link auth-link--right"
            onClick={onForgotPassword}
            disabled={submitting}
          >
            Forgot password?
          </button>

          <button type="submit" className="btn btn--primary auth-submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}