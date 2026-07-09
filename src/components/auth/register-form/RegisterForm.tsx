"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import styles from "./register-form.module.scss";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
    } catch {
      // Error handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Register</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="register-name">Name</label>
        <input
          type="text"
          id="register-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-email">Email</label>
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-password">Password</label>
        <input
          type="password"
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          minLength={8}
        />
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
