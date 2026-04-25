import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { Session, User } from "@supabase/supabase-js";
import type { AppUser } from "./types";

interface AuthContextValue {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const ADMIN_EMAIL = "admin@bakeease.com";

const AuthContext = createContext<AuthContextValue | null>(null);

async function buildAppUser(supaUser: User | null): Promise<AppUser | null> {
  if (!supaUser) return null;

  // Fetch role from user_roles. Defer to setTimeout to avoid blocking auth listener.
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", supaUser.id);

  const isAdmin = roles?.some((r) => r.role === "admin") ?? false;

  // Try to load profile (may not exist yet on first event)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", supaUser.id)
    .maybeSingle();

  return {
    id: supaUser.id,
    email: supaUser.email ?? "",
    fullName:
      profile?.full_name ||
      (supaUser.user_metadata?.full_name as string) ||
      supaUser.email?.split("@")[0] ||
      "User",
    phone: profile?.phone ?? (supaUser.user_metadata?.phone as string) ?? undefined,
    role: isAdmin ? "admin" : "customer",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Defer Supabase calls so we don't deadlock the auth callback
        setTimeout(() => {
          buildAppUser(newSession.user).then(setUser);
        }, 0);
      } else {
        setUser(null);
      }
    });

    // 2. THEN fetch existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        buildAppUser(data.session.user).then((u) => {
          setUser(u);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const loginWithGoogle: AuthContextValue["loginWithGoogle"] = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/home`,
    });
    if (result.error) throw result.error;
  };

  const register: AuthContextValue["register"] = async ({ fullName, email, phone, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { full_name: fullName, phone },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!session,
        isAdmin: user?.role === "admin",
        login,
        loginWithGoogle,
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
