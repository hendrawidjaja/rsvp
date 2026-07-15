"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import Button from "@/atomic/Button/Button";
import Input from "@/atomic/Input/Input";
import { loginSchema } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";
import styles from "./styles.module.scss";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAsProvider, setLoginAsProvider] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, loginAsProvider: providerLogin, isLoading, error } = useAuthStore();

  const isSubmitDisabled = !email || !password || isLoading;

  const handleChange = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    useAuthStore.setState({ error: null });
    if (errors.email || errors.password) setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    try {
      if (loginAsProvider) await providerLogin(email, password);
      else await login(email, password);
    } catch {}
  };

  useEffect(() => { useAuthStore.setState({ error: null }); }, []);

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div className={styles.alert}>{error}</div>}
      <Input autoComplete="email" error={errors.email} id="login-email" label="Email" onChange={handleChange(setEmail)} required type="email" value={email} />
      <Input autoComplete="current-password" error={errors.password} id="login-password" label="Password" onChange={handleChange(setPassword)} required type="password" value={password} />
      <div className={styles.providerToggle}>
        <Input checked={loginAsProvider} id="login-as-provider" label="Login as service provider" onChange={(e) => setLoginAsProvider(e.target.checked)} type="checkbox" />
      </div>
      <Button ariaLabel="Login" disabled={isSubmitDisabled} fullWidth type="submit">
        {isLoading ? "Logging in..." : loginAsProvider ? "Login as Provider" : "Login"}
      </Button>
      <p className={styles.forgotLink}><Link href="/forgot-password">Forgot password?</Link></p>
    </form>
  );
}
