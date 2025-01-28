import classNames from "classnames";
import { HTMLAttributes } from "react";

type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span";
type TypographyStyle =
  | TypographyElement
  | "h1Large"
  | "h2Large"
  | "bodyLarge"
  | "bodyDefault"
  | "bodySmall"
  | "bodyExtraSmall"
  | "label";

const baseStyles: Record<TypographyStyle, string> = {
  h1: "font-slab text-3xl 2xl:text-4xl font-semibold leading-tight",
  h2: "font-slab text-xl 2xl:text-2xl font-semibold leading-tight",
  h3: "font-slab text-md 2xl:text-lg font-medium leading-tight",
  h4: "font-sans text-md 2xl:text-xl font-semibold leading-tight",
  h5: "font-sans text-base 2xl:text-lg font-semibold leading-tight",
  p: "font-sans text-base 2xl:text-md leading-snug",
  span: "",
  h1Large:
    "font-slab text-dark-800 text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-medium leading-none",
  h2Large:
    "font-slab text-dark-800 text-2xl md:text-2xl lg:text-3xl 2xl:text-4xl font-medium leading-none",
  bodyLarge: "font-sans text-lg 2xl:text-xl leading-snug",
  bodyDefault: "font-sans text-base 2xl:text-md leading-snug",
  bodySmall: "font-sans text-sm 2xl:text-base leading-snug",
  bodyExtraSmall: "font-sans text-xs 2xl:text-sm leading-snug",
  label: "text-sm md:text-base font-bold text-dark-800 leading-none",
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
