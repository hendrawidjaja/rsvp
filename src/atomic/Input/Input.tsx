"use client";

import { type ChangeEvent, type InputHTMLAttributes, useState } from "react";
import styles from "./styles.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
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
  ...props
}: InputProps) => {
  const [internalValue, setInternalValue] = useState(value || "");

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
  };

  if (type === "checkbox") {
    return (
      <div className={`${styles.checkbox}${className ?? ""}`}>
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
    <div className={`${styles.container}${className ?? ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.wrapper}>
        <input
          className={`${styles.input}${error ? styles.inputError : ""}`}
          id={id}
          onChange={handleChange}
          type={type}
          value={internalValue}
          {...props}
        />
        {String(internalValue).length > 2 && (
          <button
            aria-label="Clear input"
            className={styles.clear}
            onClick={handleClear}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;