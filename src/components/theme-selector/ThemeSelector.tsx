"use client";

import { useAuthStore } from "@/stores/authStore";
import { type Theme, useThemeStore } from "@/stores/themeStore";
import styles from "./theme-selector.module.scss";

export default function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();
  const { isAuthenticated, updateTheme } = useAuthStore();

  const select = async (next: Theme) => {
    setTheme(next);
    if (isAuthenticated) {
      try {
        await updateTheme(next);
      } catch {
        // theme applied locally even if api fails
      }
    }
  };

  return (
    <div className={styles.selector}>
      <button
        type="button"
        aria-label="Light theme"
        className={`${styles.option} ${theme === "light" ? styles.active : ""}`}
        onClick={() => select("light")}
      >
        ☀️
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        className={`${styles.option} ${theme === "dark" ? styles.active : ""}`}
        onClick={() => select("dark")}
      >
        🌙
      </button>
    </div>
  );
}
