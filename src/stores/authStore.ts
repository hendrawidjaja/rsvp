"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  email: string;
  id: string;
  isTenant: boolean;
  name: string;
  phone?: string;
  tenantType?: string;
  theme: string;
}

interface AuthState {
  error: string | null;
  fetchUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    tenantType?: string,
  ) => Promise<void>;
  token: string | null;
  updateTheme: (theme: string) => Promise<void>;
  user: User | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      error: null,

      fetchUser: async () => {
        const { token } = get();
        if (!token) {
          return;
        }
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            set({ isAuthenticated: true, user: data.data });
          }
        } catch {
          set({ isAuthenticated: false, token: null, user: null });
        }
      },
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ error: null, isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message);
          }
          set({
            isAuthenticated: true,
            isLoading: false,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Login failed",
            isLoading: false,
          });
        }
      },

      logout: () => set({ isAuthenticated: false, token: null, user: null }),

      register: async (email, password, name, phone?, tenantType?) => {
        set({ error: null, isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            body: JSON.stringify({
              email,
              name,
              password,
              phone,
              tenant_type: tenantType || null,
            }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message);
          }
          set({
            isAuthenticated: true,
            isLoading: false,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Registration failed",
            isLoading: false,
          });
        }
      },
      token: null,

      updateTheme: async (theme) => {
        const { token } = get();
        if (!token) {
          return;
        }
        await fetch(`${API_URL}/auth/theme`, {
          body: JSON.stringify({ theme }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "PUT",
        });
        set((s) => ({ user: s.user ? { ...s.user, theme } : null }));
      },
      user: null,
    }),
    { name: "auth-storage" },
  ),
);