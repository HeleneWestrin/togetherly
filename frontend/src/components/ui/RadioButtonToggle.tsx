import { useState } from "react";

interface RadioButtonToggleProps<T extends string> {
  name: string;
  legend?: string;
  srOnly?: boolean;
  options: { label: string; value: T }[];
  onChange?: (value: T) => void;
  defaultValue?: T;
  className?: string;
  value?: T;
}

const RadioButtonToggle = <T extends string>({
  name,
  legend,
  srOnly,
  options,
  onChange,
  defaultValue,
  className,
  value,
}: RadioButtonToggleProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState(
    value
      ? options.findIndex((opt) => opt.value === value)
      : defaultValue
      ? options.findIndex((opt) => opt.value === defaultValue)
      : 0
  );

  return (
    <fieldset
      className={`relative flex items-center justify-between p-1 rounded-full ${className}`}
    >
      {legend && (
        <legend
          className={`text-sm md:text-base font-bold text-dark-800 leading-none mb-2 ${
            srOnly ? "sr-only" : ""
          }`}
        >
          {legend}
        </legend>
      )}
      <div className="relative flex items-center justify-between w-full rounded-full bg-dark-100 border-2 border-transparent has-[input:focus-visible]:border-pink-700 has-[input:focus-visible]:shadow-pink-focus">
        {options.map((option, index) => (
          <label
            key={`${name}-${option.value}-label`}
            className="relative rounded-full z-10 flex-1 text-sm lg:text-base text-center font-semibold py-3 cursor-pointer text-dark-800 has-[input:checked]:text-white focus-within:text-white transition-colors duration-300"
          >
            <input
              type="radio"
              name={name}
              id={`${name}-${option.value}`}
              value={option.value}
              className="sr-only"
              checked={value ? value === option.value : index === selectedIndex}
              onChange={(e) => {
                onChange?.(e.target.value as T);
                setSelectedIndex(index);
              }}
            />
            {option.label}
          </label>
        ))}
        <div
          className={`absolute h-full ${
            options.length === 1
              ? "w-[calc(100%-0.5rem)]"
              : options.length === 2
              ? "w-1/2"
              : "w-1/3"
          } bg-dark-800 rounded-full transition-transform duration-300`}
          style={{
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        ></div>
      </div>
    </fieldset>
  );
};

export default RadioButtonToggle;
