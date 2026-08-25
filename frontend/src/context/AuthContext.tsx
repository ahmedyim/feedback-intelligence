import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { axiosInstance } from "../api/axiosInstance";

interface AuthContextType {
  userEmail: string | null;
  isAuthenticated: boolean;
  checkingAuth: boolean;
  login: (email: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (!cancelled) setUserEmail(res.data.email);
      } catch {
        if (!cancelled) setUserEmail(null);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  function login(email: string) {
    setUserEmail(email);
  }

  async function logout() {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // even if the server call fails, clear local state
    } finally {
      setUserEmail(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        isAuthenticated: !!userEmail,
        checkingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}