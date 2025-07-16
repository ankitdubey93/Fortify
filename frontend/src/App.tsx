import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import SetMaster from "./pages/SetMaster";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./contexts/AuthContext";
import CredentialVault from "./pages/CredentialVault";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" />;
};

const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/set-master-password"
          element={
            <ProtectedRoute>
              <SetMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/credential-vault"
          element={
            <ProtectedRoute>
              <CredentialVault />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />}></Route>
      </Route>
    </Routes>
  );
};

export default App;
