import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import "./dashboard.css";

type View = "login" | "forgot-password";

function AppContent() {
  const [view, setView] = useState<View>("login");
  const { login, logout, userEmail, mustChangePassword, clearMustChangePassword } = useAuth();

  function handleLogin(email: string, accessToken: string, mustChange: boolean) {
    login(email, accessToken, mustChange);
  }

  // Reset-password link is unauthenticated and must be reachable
  // regardless of login state — check before the auth gate.
  if (window.location.pathname === "/reset-password") {
    return (
      <ResetPasswordPage
        onBackToLogin={() => {
          window.history.replaceState({}, "", "/");
          setView("login");
          window.location.reload()
        }}
      />
    );
  }

  const loginScreen =
    view === "login" ? (
      <Login onLogin={handleLogin} onForgotPassword={() => setView("forgot-password")} />
    ) : (
      <ForgotPassword onBackToLogin={() => setView("login")} />
    );

  return (
    <ProtectedRoute fallback={loginScreen}>
      {mustChangePassword ? (
        <ChangePasswordPage onSuccess={clearMustChangePassword} />
      ) : (
        <Dashboard userEmail={userEmail!} onLogout={logout} />
      )}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;