"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/login-form/LoginForm";
import styles from "./styles.module.scss";

export default function AuthPage() {
  return (
    <div className={styles.container}>
      <LoginForm />

      <div className={styles.wrapper}>
        Don't have an account?{" "}
        <Link className={styles.link} href="/register">
          Register
        </Link>
      </div>
    </div>
  );
}