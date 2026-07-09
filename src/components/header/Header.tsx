"use client";

import { useState } from "react";
import ThemeSelector from "@/components/theme-selector/ThemeSelector";
import { useAuthStore } from "@/stores/authStore";
import styles from "./header.module.scss";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>RSVP Manager</h1>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={styles.themeToggle}
          >
            🎨 Theme
          </button>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{user?.name}</span>
              <button
                type="button"
                onClick={logout}
                className={styles.logoutBtn}
              >
                Logout
              </button>
            </div>
          ) : (
            <span className={styles.guestText}>Guest</span>
          )}
        </div>
      </div>
      {showThemeSelector && <ThemeSelector />}
    </header>
  );
}