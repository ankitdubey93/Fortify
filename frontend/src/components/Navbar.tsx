import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signout } from "../services/authServices";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setUser } = useAuth();

  const handleSignout = async () => {
    try {
      await signout();
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Signout failed:", error);
    }
  };

  const isDashboard = location.pathname === "/dashboard";
  const isVault = location.pathname === "/dashboard/credential-vault";
  const isAccount = location.pathname === "/dashboard/account";
  const isResetPassword = location.pathname === "/dashboard/account/reset-password"
   const isMasterPasswordReset = location.pathname === "/dashboard/account/reset-master-password"

  return (
    <nav className="bg-sky-700 text-white p-4 flex justify-between items-center shadow">
      <Link to="/" className="text-xl font-bold hover:underline">
        Fortify
      </Link>
      <div>
        {isLoggedIn && (isVault || isAccount || isResetPassword || isMasterPasswordReset) && (
          <Link
            to="/dashboard"
            className="bg-sky-600 hover:bg-sky-800 text-white px-4 py-1  rounded transition-colors duration-200"
          >
            Dashboard
          </Link>
        )}
        {isLoggedIn && (isDashboard || isResetPassword || isMasterPasswordReset) && (
          <Link
            to="/dashboard/account"
            className="bg-sky-600 hover:bg-sky-800 text-white px-4 py-1 ml-2 rounded transition-colors duration-200"
          >
            Account
          </Link>
        )}
        {isLoggedIn && (isDashboard || isVault || isAccount || isResetPassword || isMasterPasswordReset) && (
          <button
            onClick={handleSignout}
            className="ml-3 bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors duration-200"
          >
            Signout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
