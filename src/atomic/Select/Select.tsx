import type { SelectHTMLAttributes } from "react";
import styles from "./styles.module.scss";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
};

const Select = ({ label, options, id, className, ...props }: SelectProps) => {
  const containerClass = [styles.container, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <select id={id} className={styles.select} {...props}>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;