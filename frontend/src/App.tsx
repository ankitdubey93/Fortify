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

const App = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  return (
    <MasterPasswordProvider>
      <div className="min-h-screen bg-sky-300">
        {!isDashboardRoute && <Navbar />}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<AboutPage />} />

            <Route
              path="/set-master-password"
              element={<SetMasterPasswordPage />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </MasterPasswordProvider>
  );
};

export default App;
