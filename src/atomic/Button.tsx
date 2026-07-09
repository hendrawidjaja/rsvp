import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import styles from "./styles.module.scss";

type ButtonProps = PropsWithChildren<{
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}>;

const Button = ({
  ariaLabel,
  children,
  className,
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) => {
  return (
    <button
      aria-disabled={disabled || undefined}
      aria-label={!children ? ariaLabel : undefined}
      className={`${styles.button} ${className ?? ""}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children || ariaLabel}
    </button>
  );
};

export default Button;