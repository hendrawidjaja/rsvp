"use client";

import { useState } from "react";
import { registerSchema } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";
import styles from "./styles.module.scss";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({ email, name, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await register(email, password, name);
    } catch {
      // Error handled by store
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Register</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="register-name">Name</label>
        <input
          className={styles.input}
          id="register-name"
          onChange={(e) => setName(e.target.value)}
          required
          type="text"
          value={name}
        />
        {errors.name && (
          <span className={styles.fieldError}>{errors.name}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="register-email">Email</label>
        <input
          className={styles.input}
          id="register-email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
        {errors.email && (
          <span className={styles.fieldError}>{errors.email}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="register-password">Password</label>
        <input
          className={styles.input}
          id="register-password"
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
        {errors.password && (
          <span className={styles.fieldError}>{errors.password}</span>
        )}
      </div>

      <button className={styles.submitBtn} disabled={isLoading} type="submit">
        {isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}