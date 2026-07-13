"use client";

import { type InputHTMLAttributes, useState } from "react";
import styles from "./styles.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  onClear?: () => void;
};

const Input = ({
  label,
  error,
  className,
  id,
  value,
  onChange,
  type,
  checked,
  onClear,
  ...props
}: InputProps) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "checkbox") {
      onChange?.(e);
      return;
    }
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    setInternalValue("");
    onChange?.({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
    onClear?.();
  };

  if (type === "checkbox") {
    return (
      <div className={`${styles.checkbox} ${className ?? ""}`}>
        <input
          checked={checked}
          id={id}
          onChange={handleChange}
          type="checkbox"
          {...props}
        />
        <label htmlFor={id}>{label}</label>
      </div>
    );
  }

  const inputClass = [styles.input, error && styles.inputError]
    .filter(Boolean)
    .join(" ");

  const containerClass = [styles.container, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.wrapper}>
        <input
          className={inputClass}
          id={id}
          onChange={handleChange}
          type={inputType}
          value={internalValue}
          {...props}
        />
        <div className={styles.actions}>
          {isPassword && String(internalValue).length > 0 && (
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={styles.toggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              type="button"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          )}
          {String(internalValue).length > 2 && (
            <button
              aria-label="Clear input"
              className={styles.clear}
              onClick={handleClear}
              tabIndex={-1}
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;