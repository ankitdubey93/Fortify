import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AccountPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  const navigate = useNavigate();

  const [registrationDate, setRegistrationDate] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }

    if (user?._id) {
      const timestamp =
        parseInt(user._id.toString().substring(0, 8), 16) * 1000;
      const date = new Date(timestamp).toLocaleDateString();
      setRegistrationDate(date);
    }
  }, [user, isLoggedIn, navigate]);

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Account Details
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-medium">User ID:</span>
          <span className="text-gray-700">{user._id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Name:</span>
          <span className="text-gray-700">{user.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Email:</span>
          <span className="text-gray-700">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Membership:</span>
          <span className="text-blue-600 font-semibold">Regular</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Registered On:</span>
          <span className="text-gray-700">{registrationDate}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/dashboard/account/reset-password")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Reset Password
        </button>
        <button
          onClick={() => navigate("/reset-master-password")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Reset Master Password
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
