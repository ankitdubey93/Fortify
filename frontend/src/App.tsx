import { Routes, Route, useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import Navbar from "./components/navbar";
import { AnimatePresence } from "framer-motion";
import { Dashboard } from "./pages/Dashboard";
import { SetMasterPasswordPage } from "./pages/SetMasterPasswordPage";

const App = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  return (
    <div className="min-h-screen bg-sky-300">
      {!isDashboardRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/set-master-password"
            element={<SetMasterPasswordPage />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
