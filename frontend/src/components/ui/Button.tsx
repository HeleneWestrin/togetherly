import { forwardRef } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon" | "inline"; // Style variant of the button
  size?: "default" | "small" | "tiny" | "icon"; // Size of the button
  isSelected?: boolean; // Selected state for toggle-like behavior
  href?: string; // Optional href to render as anchor instead of button
  className?: string; // Additional CSS classes
  children: React.ReactNode; // Button content
  tooltip?: string; // Tooltip text
}

type ButtonOrAnchorProps = ButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonOrAnchorProps
>(
  (
    {
      type = "button",
      variant = "primary",
      size = "default",
      className = "",
      isSelected = false,
      href,
      onClick,
      children,
      tooltip,
      ...rest
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        "bg-dark-800 border-2 border-dark-800 text-white hover:bg-pink-700 hover:border-pink-700 hover:text-white disabled:cursor-not-allowed",
      secondary: `border-2 border-solid border-dark-800 text-dark-800 hover:bg-dark-800 hover:border-dark-800 hover:text-white disabled:cursor-not-allowed`,
      ghost:
        "bg-transparent text-dark-950 hover:bg-dark-950 hover:text-white disabled:cursor-not-allowed",
      inline:
        "text-sm md:text-base hover:text-pink-600 disabled:cursor-not-allowed",
      icon: "bg-dark-100 hover:bg-dark-200 text-dark-800 hover:text-dark-950 disabled:cursor-not-allowed",
    } as const;

    const sizeClasses = {
      default:
        "font-slab text-base md:text-md px-5 py-3 md:px-6 2xl:px-7 2xl:py-4 min-h-12 md:min-h-14",
      small: "text-sm px-3 py-1.5 md:px-4 md:py-2",
      tiny: "px-1 py-1",
      icon: "p-2 rounded-full",
    } as const;

    const classes = `font-sans font-semibold flex items-center gap-2 justify-center rounded-full transition duration-300 ease-in-out ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    const Component = href ? ("a" as const) : ("button" as const);

    const componentProps = {
      className: classes,
      ...(href ? { href } : { type, onClick }),
      ...rest,
    } as ButtonOrAnchorProps;

    const ButtonContent = (
      <Component
        ref={ref as any}
        {...componentProps}
      >
        {children}
      </Component>
    );

    if (tooltip) {
      return (
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>{ButtonContent}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="rounded-md bg-dark-950 px-3 py-1.5 text-xs font-semibold text-white"
                sideOffset={5}
              >
                {tooltip}
                <Tooltip.Arrow className="fill-dark-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }

    return ButtonContent;
  }
);

Button.displayName = "Button";
