import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
    fallback: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, checkingAuth } = useAuth();

    if (checkingAuth) {
        return <div className="auth-screen">Loading…</div>;
    }

    if (!isAuthenticated) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}