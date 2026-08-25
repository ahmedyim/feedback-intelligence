import { useState } from "react";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 500);
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

        {sent ? (
          <>
            <h1 className="auth-title">Check your inbox</h1>
            <p className="auth-subtitle">
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
            </p>
            <button className="btn btn--primary auth-submit" onClick={onBackToLogin}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

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
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn--primary auth-submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </button>

              <button type="button" className="auth-link auth-link--center" onClick={onBackToLogin}>
                Back to sign in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
