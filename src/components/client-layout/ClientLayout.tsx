"use client";

import { type ReactNode, useEffect } from "react";
import Header from "@/components/header/Header";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import styles from "./client-layout.module.scss";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { fetchUser } = useAuthStore();
  const { applyTheme } = useThemeStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      useThemeStore.setState({
        theme: savedTheme as "light" | "dark",
      });
    }
    applyTheme();
    fetchUser();
  }, [fetchUser, applyTheme]);

  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
    </>
  );
}