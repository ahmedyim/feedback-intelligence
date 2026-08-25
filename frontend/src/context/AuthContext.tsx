import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { axiosInstance, setAccessToken as setApiAccessToken } from "../api/axiosInstance";

interface AuthContextType {
  userEmail: string | null;
  accessToken: string | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  checkingAuth: boolean;
  login: (email: string, accessToken: string, mustChangePassword: boolean) => void;
  logout: () => Promise<void>;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        // /auth/me only confirms the refresh cookie is valid + who the user is.
        // It does NOT give us a fresh access token, so we still need /auth/refresh.
        const meRes = await axiosInstance.get("/auth/me");
        if (cancelled) return;

        const refreshRes = await axiosInstance.post("/auth/refresh");
        if (cancelled) return;

        setUserEmail(meRes.data.email);
        setMustChangePassword(meRes.data.must_change_password)
        setAccessTokenState(refreshRes.data.access_token);
        setApiAccessToken(refreshRes.data.access_token);

      } catch {
        if (!cancelled) {
          setUserEmail(null);
          setAccessTokenState(null);
          setApiAccessToken(null);
        }
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  function login(email: string, token: string, mustChange: boolean) {
    setUserEmail(email);
    setAccessTokenState(token);
    setApiAccessToken(token);
    setMustChangePassword(mustChange);
  }

  function clearMustChangePassword() {
    setMustChangePassword(false);
  }

  async function logout() {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // even if the server call fails, clear local state
    } finally {
      setUserEmail(null);
      setAccessTokenState(null);
      setApiAccessToken(null);
      setMustChangePassword(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        accessToken,
        mustChangePassword,
        isAuthenticated: !!accessToken,
        checkingAuth,
        login,
        logout,
        clearMustChangePassword,
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