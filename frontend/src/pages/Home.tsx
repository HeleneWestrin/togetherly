import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import logo from "../assets/togetherly-logo.svg";
import { Typography } from "../components/ui/Typography";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-between p-8 pb-0 min-h-screen">
        <div className="min-h-[calc(100vh-11.5rem)] flex flex-col rounded-3xl">
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center">
              <Typography
                element="h1"
                styledAs="h1Large"
              >
                Plan your dream wedding
              </Typography>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-between px-10 grow">
          <img
            src={logo}
            alt="Togetherl logo"
            className="h-8"
          />
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-gradient-full"></div>
    </>
  );
};

export default Home;
