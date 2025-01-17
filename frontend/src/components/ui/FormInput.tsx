import { InputHTMLAttributes, ChangeEvent } from "react";
import FormLabel from "./FormLabel";

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "text" | "number" | "tel" | "url" | "password" | "email" | "search";
  id: string;
  name: string;
  label?: string;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({
  type = "text",
  id,
  name,
  label,
  value,
  placeholder,
  onChange,
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
        className="form-input w-full border-2 rounded-md border-dark-400 bg-white px-2 py-2 focus:border-pink-600 focus:shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 md:px-4 md:py-4"
        {...rest}
      />
    </div>
  );
};

export default FormInput;
