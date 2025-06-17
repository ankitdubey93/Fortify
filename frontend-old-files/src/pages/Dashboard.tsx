import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardData,
  getMasterPasswordStatus,
} from "../services/apiService";

interface User {
  _id: string;
  name: string;
  username: string;
}

export const Dashboard: React.FunctionComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [masterPasswordStatus, SetMasterPasswordStatus] =
    useState<boolean>(false);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, masterPasswordStatus] = await Promise.all([
          getDashboardData(),
          getMasterPasswordStatus(),
        ]);

        const { _id, name, username } = userData;
        console.log(userData);
        setUser({
          _id,
          name,
          username,
        });

        SetMasterPasswordStatus(masterPasswordStatus.hasMasterPassword);
      } catch (error) {
        console.error("Dashboard error:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div>Loading .....</div>;

  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col space-y-6 justify-between items-left mb-4">
          {user && !masterPasswordStatus && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md text-center"
              role="alert"
            >
              <p className="font-bold text-lg mb-2">Critical Warning!</p>
              <p>
                Your Master Password has not been set. You cannot access your
                Credential Vault without it. Please set it up to secure your
                data.{" "}
                <a href="/set-master-password" className="font-bold underline">
                  Click here!
                </a>{" "}
                to set your master password.
              </p>
            </div>
          )}

          <div>
            <button
              className="px-12 py-6 bg-sky-500 text-white text-xl font-bold rounded-lg shadow-lg shadow-sky-600/50 tracking-wide uppercase
            focus:ring-4 focus:ring-sky-300 focus:ring-opacity-75 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-sky-600 hover:shadow-2xl
            hover:shadow-sky-700/60
            "
            >
              Credential Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
