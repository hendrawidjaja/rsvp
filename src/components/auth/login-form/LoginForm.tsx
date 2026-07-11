"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/atomic/Input/Input";
import { loginSchema } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";
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

      <Input
        error={errors.email}
        id="login-email"
        label="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        value={email}
      />

      <Input
        error={errors.password}
        id="login-password"
        label="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
        type="password"
        value={password}
      />

      <button className={styles.submitBtn} disabled={isLoading} type="submit">
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <p className={styles.forgotLink}>
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </form>
  );
}