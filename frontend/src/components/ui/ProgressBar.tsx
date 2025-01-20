interface ProgressBarProps {
  progress: number;
  height?: "small" | "medium";
  color?: "pink" | "blue" | "green" | "yellow";
  className?: string;
}

const getProgressColors = (
  color: ProgressBarProps["color"] = "pink",
  progress: number
) => {
  const colors = {
    pink: {
      bg: progress > 100 ? "bg-white" : "bg-pink-300",
      fill: "bg-pink-600",
      fillOver: "bg-pink-700",
    },
    blue: {
      bg: progress > 100 ? "bg-white" : "bg-blue-300",
      fill: "bg-blue-600",
      fillOver: "bg-blue-700",
    },
    green: {
      bg: progress > 100 ? "bg-white" : "bg-green-300",
      fill: "bg-green-600",
      fillOver: "bg-green-700",
    },
    yellow: {
      bg: progress > 100 ? "bg-white" : "bg-yellow-300",
      fill: "bg-yellow-600",
      fillOver: "bg-yellow-700",
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
  const colors = getProgressColors(color, progress);
  const heightClass = getHeight(height);
  const isOverProgress = progress > 100;
  const baseProgress = Math.min(progress, 100);
  const overProgress = isOverProgress ? progress - 100 : 0;

  return (
    <div
      className={`w-full ${colors.bg} rounded-full ${heightClass} ${className}`}
    >
      <div className="flex w-full gap-2">
        <div
          className={`${colors.fill} ${heightClass} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${baseProgress}%` }}
        />
        {isOverProgress && (
          <div
            className={`${colors.fillOver} ${heightClass} rounded-full transition-all duration-300 ease-in-out bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,rgba(255,255,255,0.24)_3px,rgba(255,255,255,0.24)_6px)]`}
            style={{ width: `${overProgress}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
