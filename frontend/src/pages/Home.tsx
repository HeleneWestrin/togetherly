import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import Logo from "../assets/togetherly-logo.svg?react";
import { Typography } from "../components/ui/Typography";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-between p-8 pb-0 min-h-svh">
        <div className="flex-1 flex flex-col rounded-3xl bg-gradient">
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

        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5 py-8 md:py-6 px-4 md:px-10">
          <Logo
            aria-label="Togetherly logo"
            className="h-8"
          />
          <div className="flex w-full md:w-auto md:items-center gap-4">
            <Button
              className="flex-1 md:flex-none"
              variant="secondary"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button
              className="flex-1 md:flex-none"
              variant="primary"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
