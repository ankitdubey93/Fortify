import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import { getDashboardData } from "../services/apiService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getDashboardData();
        setIsAuthenticated(!!data);
      } catch (error) {
        setIsAuthenticated(false);
        console.error(error);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <p>Loading.....</p>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
