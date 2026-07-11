"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/schemas";

interface AuthState {
  error: string | null;
  fetchUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
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
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch user");
          }

          set({
            isAuthenticated: true,
            user: data.data,
          });
        } catch {
          set({
            isAuthenticated: false,
            token: null,
            user: null,
          });
        }
      },
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ error: null, isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Login failed");
          }

          set({
            isAuthenticated: true,
            isLoading: false,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          error: null,
          isAuthenticated: false,
          token: null,
          user: null,
        });
      },

      register: async (email: string, password: string, name: string) => {
        set({ error: null, isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            body: JSON.stringify({ email, name, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Registration failed");
          }

          set({
            isAuthenticated: true,
            isLoading: false,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },
      token: null,

      updateTheme: async (theme: string) => {
        const { token } = get();
        if (!token) {
          return;
        }

        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/theme`, {
            body: JSON.stringify({ theme }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            method: "PUT",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to update theme");
          }

          set((state) => ({
            isLoading: false,
            user: state.user ? { ...state.user, theme: data.data.theme } : null,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update theme",
            isLoading: false,
          });
        }
      },
      user: null,
    }),
    {
      name: "auth-storage",
    },
  ),
);