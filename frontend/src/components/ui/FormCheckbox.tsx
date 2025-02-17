import { motion } from "framer-motion";
import { FC } from "react";

type FormCheckboxProps = {
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "small" | "medium" | "large";
};

const sizeClasses = {
  small: "w-5 h-5",
  medium: "w-6 h-6",
  large: "w-7 h-7",
};

const svgSizeClasses = {
  small: "w-4 h-4",
  medium: "w-5 h-5",
  large: "w-6 h-6",
};

const FormCheckbox: FC<FormCheckboxProps> = ({
  id,
  label = "",
  checked,
  onChange,
  size = "medium",
}) => {
  return (
    <div
      id={id}
      className="inline-flex items-center cursor-pointer group"
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <motion.div
        className={`${sizeClasses[size]} border-2 rounded flex items-center justify-center hover:shadow-dark-focus transition-shadow duration-200 ease-in-out group-aria-checked:hover:shadow-pink-focus`}
        animate={{
          backgroundColor: checked ? "#B02F8B" : "#ffffff",
          borderColor: checked ? "#B02F8B" : "#283333",
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${svgSizeClasses[size]} text-white`}
        >
          <motion.polyline
            points="4 12 9 17 20 6"
            initial={{ pathLength: checked ? 1 : 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </motion.svg>
      </motion.div>
      {label && <span className="ml-2 text-dark-800">{label}</span>}
    </div>
  );
};

export default FormCheckbox;
