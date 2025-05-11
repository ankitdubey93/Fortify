import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
};

export default App;
