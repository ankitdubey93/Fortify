
import React, { useState } from "react";
import { resetForgottenPassword } from "../services/authServices";


const ResetForgottenPassword: React.FC = () => {
 
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = new URLSearchParams(window.location.search).get("token");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!token) {
  setError("Reset token is missing.");
  return;
}

console.log(token);
    try {
      const response = await resetForgottenPassword(token, newPassword);

     

      if(response.success) {
        setSuccess(response.message || "Something went wrong.")
        
      } else {
        setError(response.message)
      }

   
    setNewPassword("");
    setConfirmNewPassword("");
    } catch (error) {
      if(error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.")
      }
    }
  };
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center text-center px-4 py-8">
      <h1 className="text-4xl font-bold text-sky-800 mb-2">Reset Password</h1>
      <div className="flex-grow flex items-center justfiy-center">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <form className="space-y-4" onSubmit={handleSubmit}>
           
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

            <input
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm New Password"
               value={confirmNewPassword}
               onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

             {error && (
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            )}     
            {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}

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

export default ResetForgottenPassword;
