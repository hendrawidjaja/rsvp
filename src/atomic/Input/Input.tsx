"use client";

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  useEffect,
  useState,
} from "react";
import { cx } from "@/lib/utils";
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

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    } as ChangeEvent<HTMLInputElement>);
    onClear?.();
  };

  if (type === "checkbox") {
    return (
      <div className={cx(styles.checkbox, className)}>
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

  return (
    <div className={cx(styles.container, className)}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <div className={styles.wrapper}>
        <input
          className={cx(styles.input, error && styles.inputError)}
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