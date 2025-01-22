import { NavLink } from "react-router-dom";
import {
  ChartPie,
  CalendarCheck2,
  Users,
  CircleUserRound,
  Grip,
} from "lucide-react";

interface MobileNavigationProps {
  weddingSlug: string;
}

const MobileNavigation = ({ weddingSlug }: MobileNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-dark-200 rounded-t-3xl px-6 py-2 z-50">
      <ul className="flex justify-between items-center">
        <NavItem
          to={`/wedding/${weddingSlug}/budget`}
          icon={<ChartPie className="w-6 h-6" />}
          label="Budget"
        />
        <NavItem
          to={`/wedding/${weddingSlug}/schedule`}
          icon={<CalendarCheck2 className="w-6 h-6" />}
          label="Schedule"
        />
        <NavItem
          to={`/wedding/${weddingSlug}/guests`}
          icon={<Users className="w-6 h-6" />}
          label="Guests"
        />
        <NavItem
          to={`/wedding/${weddingSlug}/users`}
          icon={<CircleUserRound className="w-6 h-6" />}
          label="Users"
        />
        <NavItem
          to={`/wedding/${weddingSlug}/more`}
          icon={<Grip className="w-6 h-6" />}
          label="More"
        />
      </ul>
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
          `flex flex-col items-center gap-1 p-2 text-dark-600 ${
            isActive ? "text-pink-600" : "hover:text-dark-800"
          }`
        }
      >
        {icon}
        <span className="text-xs">{label}</span>
      </NavLink>
    </li>
  );
};

export default MobileNavigation;
