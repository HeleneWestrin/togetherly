import { useState } from "react";

interface RadioButtonToggleProps {
  name: string;
  legend: string;
  srOnly?: boolean;
  options: string[];
  onChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  value?: string;
  checked?: boolean;
}

const RadioButtonToggle = ({
  name,
  legend,
  srOnly,
  options,
  onChange,
  defaultValue,
  className,
  value,
  checked,
}: RadioButtonToggleProps) => {
  const [selectedIndex, setSelectedIndex] = useState(
    value
      ? options.indexOf(value)
      : defaultValue
      ? options.indexOf(defaultValue)
      : 0
  );

  return (
    <fieldset
      className={`relative flex items-center justify-between p-1 rounded-full ${className}`}
    >
      <legend
        className={`text-sm md:text-base font-bold text-dark-800 leading-none mb-2 ${
          srOnly ? "sr-only" : ""
        }`}
      >
        {legend}
      </legend>
      <div className="relative flex items-center justify-between w-full rounded-full bg-dark-100">
        {options.map((option, index) => (
          <label
            key={`${name}-${option}-label`}
            className="relative rounded-full z-10 flex-1 text-sm lg:text-base text-center font-semibold py-3 cursor-pointer text-dark-800 has-[input:checked]:text-white focus-within:text-white transition-colors duration-300"
          >
            <input
              type="radio"
              name={name}
              id={`${name}-${option}`}
              value={option}
              className="sr-only"
              checked={value ? value === option : index === selectedIndex}
              onChange={(e) => {
                onChange?.(e.target.value);
                setSelectedIndex(index);
              }}
            />
            {option}
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
