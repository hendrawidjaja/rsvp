"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/login-form/LoginForm";
import RegisterForm from "@/components/auth/register-form/RegisterForm";
import styles from "./styles.module.scss";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.container}>
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <p className={styles.switchText}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          className={styles.switchButton}
          onClick={() => setIsLogin(!isLogin)}
          type="button"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}