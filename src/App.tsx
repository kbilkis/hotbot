import { ClerkProvider } from "@clerk/clerk-react";
import { LocationProvider, Router, Route } from "preact-iso";
import { SWRConfig } from "swr";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import { getViteEnvKey } from "./lib/getViteEnvKey";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Subscription from "./pages/Subscription";
import UpgradeCancel from "./pages/UpgradeCancel";
import UpgradeSuccess from "./pages/UpgradeSuccess";

H.init("7e3y9r5g", {
  serviceName: "hotbot-frontend",
  tracingOrigins: true,
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    urlBlocklist: [],
  },
});

function App() {
  const clerkKey = getViteEnvKey("VITE_CLERK_PUBLISHABLE_KEY");

  return (
    <LocationProvider>
      <ClerkProvider publishableKey={clerkKey}>
        <SWRConfig
          value={{
            // Global SWR configuration
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            dedupingInterval: 5 * 60 * 1000, // 5 minutes
            errorRetryCount: 2,
            errorRetryInterval: 1000,
          }}
        >
          <Layout>
            <Router>
              <Route path="/" component={LandingPage} />
              <Route
                path="/dashboard"
                component={() => (
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/subscription"
                component={() => (
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/auth/callback/:provider"
                component={() => (
                  <ProtectedRoute>
                    <AuthCallback />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/upgrade/success"
                component={() => (
                  <ProtectedRoute>
                    <UpgradeSuccess />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/upgrade/cancel"
                component={() => (
                  <ProtectedRoute>
                    <UpgradeCancel />
                  </ProtectedRoute>
                )}
              />
            </Router>
          </Layout>
        </SWRConfig>
      </ClerkProvider>
    </LocationProvider>
  );
}

export default App;
