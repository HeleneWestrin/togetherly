import { NavLink } from "react-router-dom";
import { ChartPie, CalendarCheck2, Users, Settings } from "lucide-react";
import Logo from "../../assets/togetherly-logo.svg?react";
import { Button } from "../ui/Button";
import { forceLogout } from "../../utils/logoutHandler";

interface DesktopNavigationProps {
  weddingSlug: string;
}

const DesktopNavigation = ({ weddingSlug }: DesktopNavigationProps) => {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-dark-200 p-6"
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="mt-4 mb-10 flex justify-center">
            <Logo
              aria-label="Togetherly logo"
              className="h-7"
            />
          </div>

          <ul className="space-y-2">
            <NavItem
              to={`/wedding/${weddingSlug}/budget`}
              icon={<ChartPie className="w-5 h-5" />}
              label="Budget"
            />
            <NavItem
              to={`/wedding/${weddingSlug}/schedule`}
              icon={<CalendarCheck2 className="w-5 h-5" />}
              label="Schedule"
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
          `flex items-center gap-3 py-3 px-4 rounded-full transition-colors ${
            isActive
              ? "bg-dark-100 text-dark-950 font-semibold"
              : "text-dark-700 hover:bg-dark-100 hover:text-dark-950"
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
