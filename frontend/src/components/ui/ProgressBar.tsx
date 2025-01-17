interface ProgressBarProps {
  progress: number;
  height?: "small" | "medium";
  color?: "pink" | "blue" | "green" | "yellow";
  className?: string;
}

const getProgressColors = (color: ProgressBarProps["color"] = "pink") => {
  const colors = {
    pink: {
      bg: "bg-pink-300",
      fill: "bg-pink-600",
    },
    blue: {
      bg: "bg-blue-300",
      fill: "bg-blue-600",
    },
    green: {
      bg: "bg-green-300",
      fill: "bg-green-600",
    },
    yellow: {
      bg: "bg-yellow-300",
      fill: "bg-yellow-600",
    },
  };
  return colors[color];
};

const getHeight = (size: ProgressBarProps["height"] = "small") => {
  return size === "medium" ? "h-4" : "h-3";
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = "small",
  color = "pink",
  className = "",
}) => {
  const colors = getProgressColors(color);
  const heightClass = getHeight(height);

  return (
    <div
      className={`w-full ${colors.bg} rounded-full ${heightClass} ${className}`}
    >
      <div
        className={`${colors.fill} ${heightClass} rounded-full transition-all duration-300 ease-in-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
