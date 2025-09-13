import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
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
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/auth/callback/:provider"
                element={
                  <ProtectedRoute>
                    <AuthCallback />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </SWRConfig>
    </ClerkProvider>
  );
}

export default App;
