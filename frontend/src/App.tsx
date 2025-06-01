import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import Navbar from "./components/navbar";
import { AnimatePresence } from "framer-motion";
import { Dashboard } from "./pages/Dashboard";
import SetMasterPasswordPage from "./pages/SetMasterPasswordPage";
import { MasterPasswordProvider } from "./contexts/MasterPasswordProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardNavbar from "./components/DashboardNavbar";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";

const AppRoutes = () => {
  const location = useLocation();
  const { user, logout, isLoadingAuth } = useAuth();

  const loggedInRoutes = [
    "/dashboard",
    "/credentials-vault",
    "set-master-password",
  ];
  const shouldShowDashboardNavbar = loggedInRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-300">
        Loading authentication status...
      </div>
    );
  }
  return (
    <>
      {shouldShowDashboardNavbar ? (
        <DashboardNavbar name={user?.name || "Guest"} onSignOut={logout} />
      ) : (
        <Navbar />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/set-master-password"
            element={
              <ProtectedRoute>
                <SetMasterPasswordPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  return (
    <MasterPasswordProvider>
      <AuthProvider>
        <div className="min-h-screen bg-sky-300">
          <AppRoutes />
        </div>
      </AuthProvider>
    </MasterPasswordProvider>
  );
};

export default App;
