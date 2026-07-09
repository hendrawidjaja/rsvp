"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import styles from "./login-form.module.scss";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Error handled by store
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="login-email">Email</label>
        <input
          className={styles.input}
          id="login-email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">Password</label>
        <input
          className={styles.input}
          id="login-password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <button className={styles.submitBtn} disabled={isLoading} type="submit">
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
