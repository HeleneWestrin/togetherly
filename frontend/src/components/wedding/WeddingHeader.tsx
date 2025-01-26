import { Button } from "../ui/Button";
import { Typography } from "../ui/Typography";
const WeddingHeader: React.FC<{
  title: string;
  buttonText?: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  onClick?: () => void;
}> = ({ title, buttonText, iconBefore, iconAfter, onClick }) => {
  return (
    <div className="flex justify-between items-center sticky top-0 bg-white py-4 px-6 rounded-br-3xl rounded-bl-3xl md:rounded-none border-b border-dark-200 z-30">
      <Typography
        element="h1"
        className="relative top-[-1px]"
      >
        {title}
      </Typography>
      {buttonText && (
        <Button
          variant="primary"
          size="small"
          onClick={onClick}
          className="flex items-center gap-2"
        >
          {iconBefore}
          {buttonText}
          {iconAfter}
        </Button>
      )}
    </div>
  );
};

export default WeddingHeader;
