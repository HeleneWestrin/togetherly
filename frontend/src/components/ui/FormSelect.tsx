import { SelectHTMLAttributes } from "react";
import FormLabel from "./FormLabel";
import { Typography } from "./Typography";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  name?: string;
  label?: string;
  error?: string;
  children: React.ReactNode;
}

const FormSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  children,
  ...rest
}: FormSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`form-select w-full border-2 rounded-lg ${
          error ? "border-red-600" : "border-dark-400"
        } bg-white px-2 py-2 focus:border-pink-700 focus:shadow-none focus:outline-4 focus:outline-pink-600/20 focus:outline-offset-0 focus:ring-0 focus:ring-offset-0 md:px-4 md:py-4`}
        {...rest}
      >
        {children}
      </select>

      {error && (
        <Typography
          element="p"
          className="text-red-600"
          styledAs="bodyExtraSmall"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default FormSelect;
