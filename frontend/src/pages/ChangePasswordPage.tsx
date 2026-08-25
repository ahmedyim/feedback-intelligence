// ChangePasswordPage.tsx
import { useState } from "react";
import { axiosInstance } from "../api/axiosInstance";

interface ChangePasswordPageProps {
    onSuccess: () => void;
}

export default function ChangePasswordPage({ onSuccess }: ChangePasswordPageProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await axiosInstance.post("/auth/change-password", {
                current_password: currentPassword,
                new_password: newPassword,
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

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
                {/* <h1 className="auth-title">Welcome back</h1> */}
                <p>You must set a new password before continuing</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <label className="auth-field">
                        <input
                            type="password"
                            placeholder="Temporary password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </label>
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
                    <button
                        className="btn btn--primary auth-submit"
                        type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>

    );
}