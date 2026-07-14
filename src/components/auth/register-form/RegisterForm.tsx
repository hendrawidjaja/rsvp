"use client";

import { useState } from "react";
import Button from "@/atomic/Button/Button";
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

  const isSubmitDisabled = !name || !email || !password || isLoading;

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
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <h2>Register</h2>

      {error && <div className={styles.error}>{error}</div>}

      <Input
        autoComplete="name"
        error={errors.name}
        id="register-name"
        label="Name"
        onChange={(e) => setName(e.target.value)}
        required
        type="text"
        value={name}
      />

      <Input
        autoComplete="email"
        error={errors.email}
        id="register-email"
        label="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        value={email}
      />

      <Input
        autoComplete="new-password"
        error={errors.password}
        id="register-password"
        label="Password"
        minLength={8}
        onChange={(e) => setPassword(e.target.value)}
        required
        type="password"
        value={password}
      />

      <Button
        ariaLabel="Register"
        disabled={isSubmitDisabled}
        fullWidth
        type="submit"
      >
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}