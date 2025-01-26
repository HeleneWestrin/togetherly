// Define props interface extending HTML button attributes
// This allows the component to accept all standard button props plus our custom ones
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon" | "inline"; // Style variant of the button
  size?: "default" | "small" | "tiny" | "icon"; // Size of the button
  isSelected?: boolean; // Selected state for toggle-like behavior
  href?: string; // Optional href to render as anchor instead of button
  className?: string; // Additional CSS classes
  children: React.ReactNode; // Button content
}

// Create a union type that combines button and anchor props
// This is needed for proper typing when the component renders as an anchor
type ButtonOrAnchorProps = ButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const Button = ({
  type = "button",
  variant = "primary",
  size = "default",
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
    secondary: `border-2 border-solid border-dark-800 text-dark-800 hover:bg-dark-950 hover:border-dark-950 hover:text-white disabled:cursor-not-allowed`,
    ghost: "bg-transparent text-dark-950 hover:bg-dark-950 hover:text-white",
    inline: "text-sm md:text-base hover:text-pink-600",
    icon: "bg-dark-100 hover:bg-dark-200 text-dark-850 hover:text-dark-950",
  } as const; // 'as const' ensures type safety for the variant object

  // Add size-specific classes
  const sizeClasses = {
    default: "font-slab text-base md:text-md px-5 py-4 md:px-6 lg:px-7",
    small: "text-sm px-3 py-1.5 md:px-4 md:py-2",
    tiny: "px-1 py-1",
    icon: "p-2 rounded-full",
  } as const;

  // Combine base classes with variant and size-specific classes
  const classes = `font-sans font-semibold flex items-center gap-2 justify-center rounded-full transition duration-300 ease-in-out ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

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
