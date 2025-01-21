import { Typography } from "../ui/Typography";
import { getWeddingDateStatus } from "../../utils/weddingCalculations";

interface WeddingHeaderProps {
  couple: Array<{ profile: { firstName: string } }>;
  date: string | null;
}

const WeddingHeader: React.FC<WeddingHeaderProps> = ({ couple, date }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex flex-col">
        <Typography element="h1">
          {couple.map((partner) => partner.profile.firstName).join(" & ")}
        </Typography>
        <Typography
          element="p"
          className="text-dark-600"
        >
          <span>{date && new Date(date).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>{date && getWeddingDateStatus(date)}</span>
        </Typography>
      </div>
    </div>
  );
};

export default WeddingHeader;
