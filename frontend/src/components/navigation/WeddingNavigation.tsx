import { useIsMobile } from "../../hooks/useIsMobile";
import { useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import MobileNavigation from "./MobileNavigation";
import DesktopNavigation from "./DesktopNavigation";

const WeddingNavigation = () => {
  const isMobile = useIsMobile();
  const params = useParams<{ weddingSlug: string }>();
  const { weddingSlug } = params;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const isWeddingRoute = location.pathname.includes("/wedding/");

  if (!weddingSlug) return null;

  // Only render navigation if user is authenticated and we're on a wedding route
  if (!isAuthenticated || !isWeddingRoute) return null;

  return isMobile ? (
    <MobileNavigation weddingSlug={weddingSlug} />
  ) : (
    <DesktopNavigation weddingSlug={weddingSlug} />
  );
};

export default WeddingNavigation;
