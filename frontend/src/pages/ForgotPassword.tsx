import React, { useState } from "react";
import { sendPasswordResetLink } from "../services/authServices";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await sendPasswordResetLink(email);
      setMessage(response.message);
    } catch (error: unknown) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-44px)] flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <p>Please enter your registered email for the password reset link</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
            required
          />

          {error && (
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
