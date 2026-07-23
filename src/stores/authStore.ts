"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  email: string;
  id: string;
  name: string;
  theme: string;
}

interface Tenant {
  account_type: string;
  id: string;
  is_active: boolean;
  slug: string;
  tenant_type: string;
}

interface AuthState {
  error: string | null;
  fetchUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProvider: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsProvider: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  registerAsProvider: (
    email: string,
    password: string,
    name: string,
    tenantType: string,
    phone?: string,
  ) => Promise<void>;
  switchMode: () => void;
  tenant: Tenant | null;
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
            try {
              const tenantRes = await fetch(`${API_URL}/tenant/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (tenantRes.ok) {
                set({
                  isProvider: true,
                  tenant: (await tenantRes.json()).data,
                });
              }
            } catch {}
          }
        } catch {
          set({
            isAuthenticated: false,
            isProvider: false,
            tenant: null,
            token: null,
            user: null,
          });
        }
      },
      isAuthenticated: false,
      isLoading: false,
      isProvider: false,
      login: async (email, password) => {
        console.log("[login] attempting with email:", email, "password length:", password.length);
        set({ error: null, isLoading: true });
        try {
          const body = JSON.stringify({ email, password });
          console.log("[login] request body:", body);
          const res = await fetch(`${API_URL}/auth/login`, {
            body,
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          console.log("[login] response status:", res.status);
          const data = await res.json();
          console.log("[login] response data:", data);
          if (!res.ok) {
            throw new Error(data.message || `HTTP ${res.status}`);
          }
          set({
            isAuthenticated: true,
            isLoading: false,
            isProvider: false,
            tenant: null,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (err) {
          console.error("[login] error:", err);
          set({
            error: err instanceof Error ? err.message : "Login failed",
            isLoading: false,
          });
          throw err;
        }
      },
      loginAsProvider: async (email, password) => {
        console.log("[loginAsProvider] attempting with email:", email);
        set({ error: null, isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/login/provider`, {
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          console.log("[loginAsProvider] response status:", res.status);
          const data = await res.json();
          console.log("[loginAsProvider] response data:", data);
          if (!res.ok) {
            throw new Error(data.message || `HTTP ${res.status}`);
          }
          set({
            isAuthenticated: true,
            isLoading: false,
            isProvider: true,
            tenant: data.data.tenant,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (err) {
          console.error("[loginAsProvider] error:", err);
          set({
            error: err instanceof Error ? err.message : "Provider login failed",
            isLoading: false,
          });
          throw err;
        }
      },
      logout: () =>
        set({
          isAuthenticated: false,
          isProvider: false,
          tenant: null,
          token: null,
          user: null,
        }),

      register: async (email, password, name) => {
        console.log("[register] attempting with email:", email);
        set({ error: null, isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            body: JSON.stringify({ email, name, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          console.log("[register] response status:", res.status);
          const data = await res.json();
          console.log("[register] response data:", data);
          if (!res.ok) {
            throw new Error(data.message || `HTTP ${res.status}`);
          }

          set({
            isAuthenticated: true,
            isLoading: false,
            token: data.data.token,
            user: data.data.user,
          });
        } catch (err) {
          console.error("[register] error:", err);
          set({
            error: err instanceof Error ? err.message : "Registration failed",
            isLoading: false,
          });
          throw err;
        }
      },
      registerAsProvider: async (email, password, name, tenantType, phone) => {
        set({ error: null, isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            body: JSON.stringify({ email, name, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message);
          }
          const token = data.data.token;
          const tenantRes = await fetch(`${API_URL}/tenant/create`, {
            body: JSON.stringify({ phone, tenant_type: tenantType }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const tenantData = await tenantRes.json();
          if (!tenantRes.ok) {
            throw new Error(tenantData.message);
          }
          set({
            isAuthenticated: true,
            isLoading: false,
            isProvider: true,
            tenant: tenantData.data,
            token,
            user: data.data.user,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Registration failed",
            isLoading: false,
          });
          throw err;
        }
      },
      switchMode: () => {
        const { isProvider, token } = get();
        if (!token) {
          return;
        }
        set({ isProvider: !isProvider });
        if (!isProvider) {
          fetch(`${API_URL}/tenant/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.data) {
                set({ tenant: d.data });
              }
            })
            .catch((err) => {
              console.error("Failed to fetch tenant:", err);
            });
        }
      },
      tenant: null,
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
