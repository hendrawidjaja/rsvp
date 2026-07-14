import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import styles from "./styles.module.scss";

type ButtonProps = PropsWithChildren<{
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  tabIndex?: number;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}>;

const Button = ({
  ariaLabel,
  children,
  className,
  disabled = false,
  fullWidth = false,
  onClick,
  tabIndex,
  type = "button",
}: ButtonProps) => {
  const buttonClass = [styles.button, fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <button
      aria-disabled={disabled || undefined}
      aria-label={!children ? ariaLabel : undefined}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      tabIndex={tabIndex}
      type={type}
    >
      {children || ariaLabel}
    </button>
  );
};

export default Button;