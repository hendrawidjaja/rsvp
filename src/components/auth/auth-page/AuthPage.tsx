"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/login-form/LoginForm";
import ThemeSelector from "@/components/theme-selector/ThemeSelector";
import styles from "./styles.module.scss";

export default function AuthPage() {
  return (
    <div className={styles.container}>
      <ThemeSelector variant="icon" />
      <LoginForm />

      <p className={styles.wrapper}>
        Don't have an account?{" "}
        <Link className={styles.link} href="/register">
          Register
        </Link>
      </p>
    </div>
  );
}