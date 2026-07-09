"use client";

import ThemeSelector from "@/components/theme-selector/ThemeSelector";
import { useAuthStore } from "@/stores/authStore";
import styles from "./styles.module.scss";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>RSVP Manager</h1>
        <div className={styles.actions}>
          <ThemeSelector />
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{user?.name}</span>

              <button
                className={styles.logoutBtn}
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className={styles.guestText}>Guest</span>
          )}
        </div>
      </div>
    </header>
  );
}