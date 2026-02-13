import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AUTH_KEY = "smart_crop_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    setIsAuthenticated(raw === "true");
  }, []);

  const login = async (phone: string, password: string) => {
    if (!phone.trim() || !password.trim()) {
      return false;
    }

    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
