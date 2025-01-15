interface LocationProps {
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
  };
}

const WeddingLocation: React.FC<LocationProps> = ({ location }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Location</h2>
      <div className="space-y-1">
        <p className="font-semibold">Location:</p>
        <p>{location.venue}</p>
        <p>{location.address}</p>
        <p>
          {location.city}, {location.country}
        </p>
      </div>
    </div>
  );
};

export default WeddingLocation;
