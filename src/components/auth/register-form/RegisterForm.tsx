"use client";

import { useState } from "react";
import Input from "@/atomic/Input/Input";
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

      <Input
        id="register-name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <Input
        id="register-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <Input
        id="register-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        minLength={8}
      />

      <button className={styles.submitBtn} disabled={isLoading} type="submit">
        {isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
