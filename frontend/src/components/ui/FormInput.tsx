import { InputHTMLAttributes, ChangeEvent } from "react";
import FormLabel from "./FormLabel";
import { Typography } from "./Typography";

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?:
    | "text"
    | "number"
    | "tel"
    | "url"
    | "password"
    | "email"
    | "search"
    | "date";
  id: string;
  name: string;
  label?: string;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const FormInput = ({
  type = "text",
  id,
  name,
  label,
  value,
  placeholder,
  onChange,
  error,
  ...rest
}: FormInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`form-input w-full border-2 rounded-md ${
          error ? "border-red-600" : "border-dark-400"
        } bg-white px-2 py-2 focus:border-pink-600 focus:shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 md:px-4 md:py-4`}
        {...rest}
      />
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

export default FormInput;
