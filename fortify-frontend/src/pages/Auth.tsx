import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignIn) {
        await loginUser({ username: form.username, password: form.password });
        navigate("/dashboard"); // replace with your protected route
      } else {
        await registerUser(form);
        setIsSignIn(true);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="bg-sky-300 min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center mt-30">
        <div className="bg-white p-8 rounded-lg shadow-md w-[90%] max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center">
            {isSignIn ? "Sign In" : "Create Account"}
          </h2>

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
              type="username"
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
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-blue-600 hover:underline font-medium"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
