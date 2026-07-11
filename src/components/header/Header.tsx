"use client";

import Button from "@/atomic/Button/Button";
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
              <Button
                ariaLabel="btn-logout"
                className={styles.logoutBtn}
                onClick={logout}
                type="button"
              >
                Logout
              </Button>
            </div>
          ) : (
            <span className={styles.guestText}>Guest</span>
          )}
        </div>
      </div>
    </header>
  );
}