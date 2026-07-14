"use client";

import { useEffect, useState } from "react";
import Button from "@/atomic/Button/Button";
import { useAuthStore } from "@/stores/authStore";
import { type Theme, useThemeStore } from "@/stores/themeStore";
import styles from "./styles.module.scss";

const themes = [
  { icon: "☀️", label: "Light theme", value: "light" },
  { icon: "🌙", label: "Dark theme", value: "dark" },
] as const;

type ThemeSelectorProps = {
  variant?: "icon" | "full";
};

export default function ThemeSelector({
  variant = "full",
}: ThemeSelectorProps) {
  const { theme, setTheme } = useThemeStore();
  const { isAuthenticated, updateTheme } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return null;
  }

  const selectorClass = [styles.selector, variant === "icon" && styles.iconOnly]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={selectorClass}>
      {themes.map(({ value, icon, label }) => (
        <Button
          ariaLabel={label}
          className={`${styles.option} ${theme === value ? styles.active : ""}`}
          key={value}
          onClick={() => select(value)}
          type="button"
        >
          {variant === "icon" ? icon : label}
        </Button>
      ))}
    </div>
  );
}