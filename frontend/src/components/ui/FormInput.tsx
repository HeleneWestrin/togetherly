import { InputHTMLAttributes, ChangeEvent } from "react";

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "text" | "number" | "tel" | "url" | "password" | "email" | "search";
  name: string;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  ...rest
}: FormInputProps) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="form-input w-full border-2 rounded-md border-dark-400 bg-transparent px-2 py-2 focus:border-pink-600 focus:shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 md:px-4 md:py-4"
      {...rest}
    />
  );
};

export default FormInput;
