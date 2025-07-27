import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import SetMaster from "./pages/SetMaster";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./contexts/AuthContext";
import CredentialVault from "./pages/CredentialVault";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import AccountPage from "./pages/AccountPage";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetForgottenPassword from "./pages/ResetForgottenPassword";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetForgottenPassword />} />
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
        <Route
          path="/dashboard/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/account/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />}></Route>
      </Route>
    </Routes>
  );
};

export default App;
