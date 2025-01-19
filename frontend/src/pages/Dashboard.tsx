import { WeddingList } from "../components/wedding/WeddingList";
import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import { forceLogout } from "../utils/logoutHandler";

const Dashboard: React.FC = () => {
  const handleLogout = () => {
    forceLogout();
  };

  return (
    <>
      <main
        id="main"
        className="min-h-screen"
      >
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Typography element="h1">Dashboard</Typography>
            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
          <div className="space-y-8">
            <WeddingList />
          </div>
        </div>
      </main>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default Dashboard;
