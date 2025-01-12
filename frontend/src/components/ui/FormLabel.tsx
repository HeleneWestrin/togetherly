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
      className={`block text-sm font-medium text-dark-700 mb-1 ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default FormLabel;
