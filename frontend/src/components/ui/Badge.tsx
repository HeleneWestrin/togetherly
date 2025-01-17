import { Typography } from "./Typography";
import { ReactNode } from "react";

export interface BadgeProps {
  color?: "blue" | "green" | "yellow" | "pink" | "gray";
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
    case "gray":
    default:
      return "bg-dark-200";
  }
};

const Badge: React.FC<BadgeProps> = ({
  color = "gray",
  children,
  className = "",
}) => {
  return (
    <div
      className={`${getBadgeColor(
        color
      )} px-2 pb-0.5 rounded-full text-center ${className}`}
    >
      <Typography
        element="span"
        styledAs="bodyExtraSmall"
        className="font-semibold"
      >
        {children}
      </Typography>
    </div>
  );
};

export default Badge;
