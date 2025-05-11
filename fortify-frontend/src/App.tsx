import { Routes, Route, useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import Navbar from "./components/navbar";
import { AnimatePresence } from "framer-motion";

const App = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-sky-300">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
