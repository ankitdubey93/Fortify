import React, { useState } from "react";

const ResetPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("New password do not match.");
      return;
    }
  };
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center text-center px-4 py-8">
      <h1 className="text-4xl font-bold text-sky-800 mb-2">Reset Password</h1>
      <div className="flex-grow flex items-center justfiy-center">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <form className="space-y-4">
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              //   value={masterPassword}
              //   onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              //   value={masterPassword}
              //   onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

            <input
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm New Password"
              //   value={confirmMasterPassword}
              //   onChange={(e) => setConfirmMasterPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

            {/* {error && (
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            )} */}

            <button
              type="submit"
              className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
