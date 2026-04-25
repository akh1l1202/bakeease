import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppUser } from "./types";

interface AuthContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "bakeease.user";
const ADMIN_EMAIL = "admin@bakeease.com"; // hardcoded admin per user request

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  const persist = (u: AppUser | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login: AuthContextValue["login"] = async (email, _password) => {
    await new Promise((r) => setTimeout(r, 400));
    const role = email.toLowerCase() === ADMIN_EMAIL ? "admin" : "customer";
    persist({
      id: crypto.randomUUID(),
      fullName: role === "admin" ? "Admin" : email.split("@")[0],
      email,
      role,
    });
  };

  const register: AuthContextValue["register"] = async ({ fullName, email, phone }) => {
    await new Promise((r) => setTimeout(r, 400));
    const role = email.toLowerCase() === ADMIN_EMAIL ? "admin" : "customer";
    persist({
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      role,
    });
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { ADMIN_EMAIL };
