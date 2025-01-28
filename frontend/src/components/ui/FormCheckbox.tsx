import { motion } from "framer-motion";
import { FC } from "react";

type FormCheckboxProps = {
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

const FormCheckbox: FC<FormCheckboxProps> = ({
  label = "",
  checked,
  onChange,
  size = "medium",
}) => {
  return (
    <div
      className="flex items-center cursor-pointer"
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
        className={`${sizeClasses[size]} border-2 rounded flex items-center justify-center`}
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
          className={`w-4 h-4 text-white`}
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
