"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/atomic/Button/Button";
import { useAuthStore } from "@/stores/authStore";
import styles from "./styles.module.scss";

export default function Header() {
  const { user, isAuthenticated, isProvider, logout, switchMode } =
    useAuthStore();
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleSwitch = () => {
    switchMode();
    router.push(isProvider ? "/dashboard" : "/provider/dashboard");
  };

  return (
    <header className={styles.header} data-is-mobile={false}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <Link href={isProvider ? "/provider/dashboard" : "/dashboard"}>
            RSVP
          </Link>
        </h1>
        <div className={styles.actions}>
          <div className={styles.usermenu}>
            <span className={styles.username}>{user?.name}</span>

            {isProvider && (
              <Button
                ariaLabel="Switch mode"
                className={styles["btn-switch"]}
                onClick={handleSwitch}
                type="button"
              >
                {isProvider ? "Switch to User" : "Switch to Provider"}
              </Button>
            )}
            <Button
              ariaLabel="btn-logout"
              className={styles["btn-logout"]}
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