import { LabelHTMLAttributes } from "react";

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormLabel = ({
  htmlFor,
  required = false,
  children,
  className = "",
  ...rest
}: FormLabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm md:text-base font-bold text-dark-800 leading-none ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
  );
};

export default FormLabel;
