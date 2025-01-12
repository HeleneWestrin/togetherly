// Define props interface extending HTML button attributes
// This allows the component to accept all standard button props plus our custom ones
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"; // Style variant of the button
  isSelected?: boolean; // Selected state for toggle-like behavior
  href?: string; // Optional href to render as anchor instead of button
  className?: string; // Additional CSS classes
  children: React.ReactNode; // Button content
}

// Create a union type that combines button and anchor props
// This is needed for proper typing when the component renders as an anchor
type ButtonOrAnchorProps = ButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button = ({
  type = "button",
  variant = "primary",
  className = "",
  isSelected = false,
  href,
  onClick,
  children,
  ...rest
}: ButtonProps) => {
  // Define Tailwind CSS classes for each variant
  const variantClasses = {
    primary: "bg-dark-800 text-white hover:bg-dark-950 hover:text-white",
    secondary: `border-2 border-solid border-dark-800 text-dark-800 hover:bg-dark-950 hover:text-white disabled:cursor-not-allowed ${
      isSelected
        ? "disabled:bg-dark-950 disabled:border-dark-950 disabled:text-white disabled:hover:text-white"
        : "disabled:hover:bg-transparent disabled:hover:text-dark-950 disabled:opacity-55"
    }`,
  } as const; // 'as const' ensures type safety for the variant object

  // Combine base classes with variant-specific classes and any additional classes
  const classes = `flex items-center gap-2 justify-center text-sm md:text-md lg:text-base rounded-full px-4 py-1 md:px-5 md:py-2 font-semibold transition duration-300 ease-in-out ${variantClasses[variant]} ${className}`;

  // Determine whether to render a button or anchor based on href prop
  const Component = href ? ("a" as const) : ("button" as const);

  // Prepare props based on component type (button or anchor)
  const componentProps = {
    className: classes,
    ...(href ? { href } : { type, onClick }), // Spread href or button-specific props
    ...rest, // Spread remaining props
  } as ButtonOrAnchorProps;

  // Render the component with all props
  return <Component {...componentProps}>{children}</Component>;
};

export default Button;
