// ResetPasswordPage.tsx
import { useState } from "react";
import { axiosInstance } from "../api/axiosInstance";

interface ResetPasswordPageProps {
    onBackToLogin: () => void;
}

export default function ResetPasswordPage({ onBackToLogin }: ResetPasswordPageProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const token = new URLSearchParams(window.location.search).get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("This reset link is missing or invalid. Please request a new one.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            await axiosInstance.post("/auth/reset-password", {
                token,
                new_password: newPassword,
            });
            setSuccess(true);
            window.location.href = "/";
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (!token) {
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
                    <h1 className="auth-title">Invalid reset link</h1>
                    <p className="auth-subtitle">
                        This link is missing or malformed. Please request a new password reset.
                    </p>
                    <button className="auth-link auth-link--center" onClick={onBackToLogin}>
                        Back to login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
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
                    <h1 className="auth-title">Password updated</h1>
                    <p className="auth-subtitle">
                        Your password has been reset. You can now log in with your new password.
                    </p>
                    <button className="btn btn--primary auth-submit" onClick={onBackToLogin}>
                        Back to login
                    </button>
                </div>
            </div>
        );
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
                <h1 className="auth-title">Reset your password</h1>
                <p className="auth-subtitle">Enter a new password for your account.</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <p className="auth-error">{error}</p>}
                    <label className="auth-field">
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </label>
                    <label className="auth-field">
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </label>
                    <button className="btn btn--primary auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Reset password"}
                    </button>
                </form>
                <button className="auth-link auth-link--center" onClick={onBackToLogin}>
                    Back to login
                </button>
            </div>
        </div>
    );
}