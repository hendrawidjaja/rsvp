"use client";

import { useAuthStore } from "@/stores/authStore";
import { type Theme, useThemeStore } from "@/stores/themeStore";
import styles from "./theme-selector.module.scss";

const themes: { value: Theme; label: string; icon: string }[] = [
  { icon: "☀️", label: "Light", value: "light" },
  { icon: "🌙", label: "Dark", value: "dark" },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();
  const { isAuthenticated, updateTheme } = useAuthStore();

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    if (isAuthenticated) {
      try {
        await updateTheme(newTheme);
      } catch {
        // Theme applied locally even if API fails
      }
    }
  };

  return (
    <div className={styles.selector}>
      <h3 className={styles.title}>Select Theme</h3>
      <div className={styles.grid}>
        {themes.map((t) => (
          <button
            aria-label={`${t.label} theme`}
            className={`${styles.option} ${theme === t.value ? styles.active : ""}`}
            key={t.value}
            onClick={() => handleThemeChange(t.value)}
            title={t.label}
            type="button"
          >
            <span className={styles.icon}>{t.icon}</span>
            <span className={styles.label}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}