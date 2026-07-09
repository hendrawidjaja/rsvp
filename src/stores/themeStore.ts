"use client";

import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  applyTheme: () => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

const themes: Record<Theme, Record<string, string>> = {
  dark: {
    "--background-color": "#1a1a2e",
    "--border-color": "#2a2a4a",
    "--card-background": "#16213e",
    "--primary-color": "#3b82f6",
    "--primary-hover": "#60a5fa",
    "--text-color": "#e0e0e0",
    "--text-muted": "#a0a0a0",
  },
  light: {
    "--background-color": "#f8f9fa",
    "--border-color": "#dee2e6",
    "--card-background": "#ffffff",
    "--primary-color": "#0070f3",
    "--primary-hover": "#0051a8",
    "--text-color": "#333333",
    "--text-muted": "#6c757d",
  },
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  applyTheme: () => {
    const { theme } = get();
    const themeVars = themes[theme];
    const root = document.documentElement;

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem("app-theme", theme);
  },
  setTheme: (theme: Theme) => {
    set({ theme });
    get().applyTheme();
  },
  theme: "light",
}));