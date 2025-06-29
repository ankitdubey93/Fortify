import React, { useState } from "react";
import { signin, signup } from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn";

const Home: React.FC = () => {
  useRedirectIfLoggedIn();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const { setIsLoggedIn, setUser } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ name: "", username: "", password: "", confirmPassword: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!.");
      return;
    }

    try {
      if (isLogin) {
        const response = await signin(formData.username, formData.password);
        if (response.ok) {
          setIsLoggedIn(true);
          setUser(response.user);

          setTimeout(() => {
            navigate("/dashboard");
          }, 0);
        } else {
          alert(response.message || "Login Failed");
        }
      } else {
        const response = await signup(
          formData.name,
          formData.username,
          formData.password
        );
        if (response && response.user) {
          setIsLoggedIn(true);
          setUser(response.user);
          navigate("/set-master-password");
        } else {
          alert(response.message || "Signup Failed");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center text-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-2">
          Welcome to Fortify test
        </h1>
        <p className="text-lg text-gray-700 max-w-xl">
          Fortify is your secure, personal password manager — easy to use and
          built with privacy in mind.
        </p>
      </div>

      <div className="flex-grow flex items-center justfiy-center">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-sky-800 mb-6">
            {isLogin ? "Login" : "Register"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                value={formData.name}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
                required
              />
            )}
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              value={formData.username}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                value={formData.confirmPassword}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
                required
              />
            )}
            <button
              type="submit"
              className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800 transition"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-sky-700 font-semibold hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
