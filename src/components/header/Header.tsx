"use client";

import Link from "next/link";
import Button from "@/atomic/Button/Button";
import ThemeSelector from "@/components/theme-selector/ThemeSelector";
import { useAuthStore } from "@/stores/authStore";
import styles from "./styles.module.scss";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <Link href="/dashboard">RSVP</Link>
        </h1>

        <div className={styles.actions}>
          <ThemeSelector />
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
        </div>
      </div>
    </header>
  );
}