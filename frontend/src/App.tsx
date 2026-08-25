import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import "./dashboard.css";

type View = "login" | "forgot-password";

function AppContent() {
  const [view, setView] = useState<View>("login");
  const { login, logout, userEmail } = useAuth();

  function handleLogin(email: string) {
    login(email);
  }

  const loginScreen =
    view === "login" ? (
      <Login onLogin={handleLogin} onForgotPassword={() => setView("forgot-password")} />
    ) : (
      <ForgotPassword onBackToLogin={() => setView("login")} />
    );

  return (
    <ProtectedRoute fallback={loginScreen}>
      <Dashboard userEmail={userEmail!} onLogout={logout} />
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