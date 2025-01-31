import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./index.css";
import "react-loading-skeleton/dist/skeleton.css";

// Configure React Query client with optimal settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Cache data for 1 minute before refetching
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: true, // Refresh data when user returns to tab
    },
  },
});

// Ensure root element exists before mounting
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Mount app with required providers:
// - GoogleOAuthProvider for authentication
// - QueryClientProvider for data fetching
// - SpeedInsights for performance monitoring
ReactDOM.createRoot(rootElement).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <SpeedInsights />
      <App />
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
