"use client";

import { api } from "@/lib/api";
import type { User } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { user: session } = await api.getSession();
    setUser(session);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: next } = await api.login(email, password);
    await api.persistSession(next);
    setUser(next);
    return next;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { user: next } = await api.signup({ name, email, password });
    await api.persistSession(next);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    await api.persistSession(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      void api.persistSession(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refresh, updateUser }),
    [user, loading, login, signup, logout, refresh, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
