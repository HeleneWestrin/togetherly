import classNames from "classnames";
import { HTMLAttributes } from "react";

type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "p";
type TypographyStyle =
  | TypographyElement
  | "bodyLarge"
  | "bodyDefault"
  | "bodySmall";

const baseStyles: Record<TypographyStyle, string> = {
  h1: "text-3xl sm:text-4xl lg:text-6xl font-medium",
  h2: "text-xl font-medium",
  h3: "text-md font-medium",
  h4: "text-md lg:text-xl font-semibold",
  h5: "text-base lg:text-lg font-semibold",
  p: "text-base",
  bodyLarge: "text-lg xl:text-lg 2xl:text-xl 3xl:text-2xl font-regular",
  bodyDefault: "text-base",
  bodySmall: "text-sm",
};

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  element?: TypographyElement;
  styledAs?: TypographyStyle;
  children: React.ReactNode;
}

/**
 * Typography component for consistent text styling across the application
 * @param element - HTML element to render ('h1', 'h2', 'p', etc.)
 * @param styledAs - Visual style to apply (can be different from element)
 * @param className - Additional CSS classes
 */
export const Typography = ({
  element: Element = "p",
  styledAs = Element,
  className,
  children,
  ...rest
}: TypographyProps): JSX.Element => {
  return (
    <Element
      className={classNames(baseStyles[styledAs], className)}
      {...rest}
    >
      {children}
    </Element>
  );
};

Typography.displayName = "Typography";
