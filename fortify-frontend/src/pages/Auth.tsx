import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isSignIn && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isSignIn) {
        await loginUser({ username: form.username, password: form.password });
        navigate("/dashboard");
      } else {
        await registerUser(form);
        setIsSignIn(true);
        setForm({ name: "", username: "", password: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-center mt-20">
        <motion.div
          key={isSignIn ? "sign-in" : "sign-up"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.1 }}
          className="bg-white p-8 rounded-lg shadow-md w-[90%] max-w-md space-y-6"
        >
          <h2 className="text-3xl font-bold text-center">
            {isSignIn ? "Sign In" : "Create Account"}
          </h2>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            )}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {!isSignIn && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {isSignIn ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setError("");
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Auth;
