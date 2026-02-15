import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { verifyGoogleToken } from "../services/authService";

interface AuthContextValue {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (phone: string, password: string) => Promise<boolean>;
  signup: (payload: SignupInput) => Promise<{ ok: boolean; reason?: "phone_exists" | "invalid" }>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  logout: () => void;
}

interface SignupInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

interface LocalUserRecord {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  picture?: string;
  provider: "local" | "google";
}

const AUTH_KEY = "smart_crop_auth";
const USERS_KEY = "smart_crop_users";
const SESSION_USER_KEY = "smart_crop_user";

function readUsers(): LocalUserRecord[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is LocalUserRecord => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.fullName === "string"
        && typeof candidate.phone === "string"
        && typeof candidate.email === "string"
        && typeof candidate.password === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeUsers(users: LocalUserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSessionUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
      return null;
    }

    const provider = candidate.provider === "google" ? "google" : "local";
    return {
      id: candidate.id,
      name: candidate.name,
      email: typeof candidate.email === "string" ? candidate.email : undefined,
      phone: typeof candidate.phone === "string" ? candidate.phone : undefined,
      picture: typeof candidate.picture === "string" ? candidate.picture : undefined,
      provider,
    };
  } catch {
    return null;
  }
}

function persistSession(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    const user = readSessionUser();
    setIsAuthenticated(raw === "true");
    setCurrentUser(user);
  }, []);

  const login = async (phone: string, password: string) => {
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();
    if (!cleanPhone || !cleanPassword) {
      return false;
    }

    const users = readUsers();
    if (users.length > 0) {
      const matched = users.find((user) => user.phone === cleanPhone && user.password === cleanPassword);
      if (!matched) {
        return false;
      }

      const sessionUser: AuthUser = {
        id: matched.phone,
        name: matched.fullName,
        email: matched.email,
        phone: matched.phone,
        provider: "local",
      };
      persistSession(sessionUser);
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      return true;
    }

    const sessionUser: AuthUser = {
      id: cleanPhone,
      name: cleanPhone,
      phone: cleanPhone,
      provider: "local",
    };
    persistSession(sessionUser);
    setCurrentUser(sessionUser);
    setIsAuthenticated(true);
    return true;
  };

  const signup = async (payload: SignupInput) => {
    const fullName = payload.fullName.trim();
    const phone = payload.phone.trim();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();

    if (!fullName || !phone || !email || !password) {
      return { ok: false, reason: "invalid" as const };
    }

    const users = readUsers();
    const phoneExists = users.some((user) => user.phone === phone);
    if (phoneExists) {
      return { ok: false, reason: "phone_exists" as const };
    }

    users.push({ fullName, phone, email, password });
    writeUsers(users);

    const sessionUser: AuthUser = {
      id: phone,
      name: fullName,
      email,
      phone,
      provider: "local",
    };
    persistSession(sessionUser);
    setCurrentUser(sessionUser);
    setIsAuthenticated(true);
    return { ok: true };
  };

  const loginWithGoogle = async (idToken: string) => {
    if (!idToken.trim()) {
      return false;
    }

    try {
      const verified = await verifyGoogleToken(idToken);
      const sessionUser: AuthUser = {
        id: verified.id,
        name: verified.name || verified.email,
        email: verified.email,
        picture: verified.picture,
        provider: "google",
      };

      persistSession(sessionUser);
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  };

  const value = useMemo(
    () => ({ isAuthenticated, currentUser, login, signup, loginWithGoogle, logout }),
    [isAuthenticated, currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
