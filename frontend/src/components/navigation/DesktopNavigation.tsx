import { NavLink } from "react-router-dom";
import { ChartPie, Utensils, Users, Settings } from "lucide-react";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { forceLogout } from "../../utils/logoutHandler";

interface DesktopNavigationProps {
  weddingSlug: string;
}

const DesktopNavigation = ({ weddingSlug }: DesktopNavigationProps) => {
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-dark-200 p-6">
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="mb-8">
            <Typography
              element="h1"
              styledAs="h2"
            >
              Menu
            </Typography>
          </div>

          <ul className="space-y-2">
            <NavItem
              to={`/wedding/${weddingSlug}/budget`}
              icon={<ChartPie className="w-5 h-5" />}
              label="Budget"
            />
            <NavItem
              to={`/wedding/${weddingSlug}/plan`}
              icon={<Utensils className="w-5 h-5" />}
              label="Plan"
            />
            <NavItem
              to={`/wedding/${weddingSlug}/guests`}
              icon={<Users className="w-5 h-5" />}
              label="Guests"
            />
            <NavItem
              to={`/wedding/${weddingSlug}/settings`}
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
            />
          </ul>
        </div>
        <Button
          variant="secondary"
          onClick={forceLogout}
        >
          Log out
        </Button>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isActive
              ? "bg-pink-100 text-pink-600"
              : "text-dark-600 hover:bg-dark-100"
          }`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default DesktopNavigation;
