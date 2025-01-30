import { InputHTMLAttributes, ChangeEvent } from "react";
import { NumericFormat } from "react-number-format";
import FormLabel from "./FormLabel";
import { Typography } from "./Typography";
import { CircleX } from "lucide-react";

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
  numericType?: "text" | "password" | "tel";
  id: string;
  className?: string;
  name: string;
  label?: string;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  isCurrency?: boolean;
  currencySymbol?: string; // Example: €, $
  currencySuffix?: string; // Example: kr, Kč
}

const FormInput = ({
  type = "text",
  numericType = "text",
  id,
  className = "",
  name,
  label,
  value,
  placeholder,
  onChange,
  error,
  isCurrency = false,
  currencySymbol = "",
  currencySuffix = "",
  ...rest
}: FormInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}

      {isCurrency ? (
        <NumericFormat
          id={id}
          type={numericType}
          name={name}
          value={value}
          placeholder={placeholder}
          thousandSeparator=" "
          decimalSeparator="."
          prefix={currencySymbol}
          suffix={currencySuffix}
          onValueChange={(values) => {
            onChange &&
              onChange({
                target: {
                  name,
                  value: values.value,
                } as unknown as EventTarget & HTMLInputElement,
              } as ChangeEvent<HTMLInputElement>);
          }}
          className={`form-input w-full border-2 rounded-lg ${
            error ? "border-red-600" : "border-dark-400"
          } bg-white px-2 py-2 focus:border-pink-700 focus:shadow-none focus:outline-4 focus:outline-pink-600/20 focus:outline-offset-0 focus:ring-0 focus:ring-offset-0 md:px-4 md:py-4 ${className}`}
        />
      ) : (
        <div
          className={type === "date" ? "flex items-center gap-3" : undefined}
        >
          <input
            id={id}
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={`form-input w-full border-2 rounded-lg ${
              error ? "border-red-600" : "border-dark-400"
            } bg-white px-2 py-2 focus:border-pink-700 focus:shadow-none focus:outline-4 focus:outline-pink-600/20 focus:outline-offset-0 focus:ring-0 focus:ring-offset-0 md:px-4 md:py-4 ${
              type === "date"
                ? "appearance-none w-full min-h-12 md:min-h-14"
                : ""
            } ${className}`}
            {...rest}
          />
          {type === "date" && value && (
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                onChange?.({
                  target: {
                    name,
                    value: "",
                  } as unknown as EventTarget & HTMLInputElement,
                } as ChangeEvent<HTMLInputElement>);
              }}
            >
              <CircleX
                aria-label="Clear date"
                className="w-5 h-5"
              />
            </button>
          )}
        </div>
      )}

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
