import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SetMaster from "./pages/SetMaster";
import Dashboard from "./pages/Dashboard";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import CredentialVault from "./pages/CredentialVault";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
    </Routes>
  );
};

export default App;
