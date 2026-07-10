"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema } from "@/lib/schemas";
import styles from "./styles.module.scss";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

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
        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
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
        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
      </div>

      <button className={styles.submitBtn} disabled={isLoading} type="submit">
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <p className={styles.forgotLink}>
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </form>
  );
}
