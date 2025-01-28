import { Typography } from "./Typography";
import { ReactNode } from "react";

export interface BadgeProps {
  color?: "blue" | "green" | "yellow" | "pink" | "gray" | "red";
  size?: "small" | "medium" | "large";
  children: ReactNode;
  className?: string;
}

const getBadgeColor = (color: BadgeProps["color"]): string => {
  switch (color) {
    case "blue":
      return "bg-blue-300";
    case "green":
      return "bg-green-300";
    case "yellow":
      return "bg-yellow-300";
    case "pink":
      return "bg-pink-300";
    case "red":
      return "bg-red-300";
    case "gray":
    default:
      return "bg-dark-200";
  }
};

const getBadgeSize = (size: BadgeProps["size"]): string => {
  switch (size) {
    case "small":
      return "px-1 py-0.5 text-xs font-semibold text-dark-950";
    case "large":
      return "px-3 py-1 text-base font-semibold text-dark-950";
    case "medium":
    default:
      return "px-2 py-0.5 text-sm font-semibold text-dark-950";
  }
};

const Badge: React.FC<BadgeProps> = ({
  color = "gray",
  size = "medium",
  children,
  className = "",
}) => {
  return (
    <div
      className={`${getBadgeColor(color)} ${getBadgeSize(
        size
      )} inline-flex items-center justify-center rounded-full text-center ${className}`}
    >
      <span>{children}</span>
    </div>
  );
};

export default Badge;
