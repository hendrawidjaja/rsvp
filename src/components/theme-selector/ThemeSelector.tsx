"use client";

import Button from "@/atomic/Button/Button";
import { useAuthStore } from "@/stores/authStore";
import { type Theme, useThemeStore } from "@/stores/themeStore";
import styles from "./styles.module.scss";

const themes = [
  { icon: "☀️", label: "Light theme", value: "light" },
  { icon: "🌙", label: "Dark theme", value: "dark" },
] as const;

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
      {themes.map(({ value, icon, label }) => (
        <Button
          ariaLabel={label}
          className={`${styles.option} ${theme === value ? styles.active : ""}`}
          key={value}
          onClick={() => select(value)}
          type="button"
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}