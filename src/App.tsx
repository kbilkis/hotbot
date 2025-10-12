import { ClerkProvider } from "@clerk/clerk-react";
import { LocationProvider, Router, Route } from "preact-iso";
import { SWRConfig } from "swr";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import SentryIdentifier from "./components/auth/SentryIdentifier";
import TawkIdentifier from "./components/auth/TawkIdentifier";
import Layout from "./components/layout/Layout";
import { getViteEnvKey } from "./lib/getViteEnvKey";
import { initSentryClient } from "./lib/sentry";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Subscription from "./pages/Subscription";
import UpgradeCancel from "./pages/UpgradeCancel";
import UpgradeSuccess from "./pages/UpgradeSuccess";

function App() {
  initSentryClient();
  const clerkKey = getViteEnvKey("VITE_CLERK_PUBLISHABLE_KEY");

  return (
    <LocationProvider>
      <ClerkProvider publishableKey={clerkKey}>
        <SentryIdentifier />
        <TawkIdentifier />
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
