import React, { useState, useEffect } from "react";
import { signin, signup } from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { setIsLoggedIn, setUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
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
        const response = await signin(formData.email, formData.password);
        if (response.ok) {
          setIsLoggedIn(true);
          setUser(response.user);
          navigate("/dashboard");
        } else {
          alert(response.message || "Login Failed");
        }
      } else {
        const response = await signup(
          formData.name,
          formData.email,
          formData.password
        );
        if (response && response.user) {
          setIsLoggedIn(true);
          setUser(response.user);
          navigate("/dashboard");
        } else {
          alert(response.message || "Signup Failed");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-200 flex flex-col items-center px-4 py-8">
      <div className="mb-8 text-center animate-fadeIn">
        <h1 className="text-4xl font-extrabold text-sky-900 mb-3 drop-shadow-lg">
          Welcome to <span className="text-sky-600">Fortify</span>
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
          Your secure, personal password manager — beautifully simple, built
          with privacy at its core.
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center w-full">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.02] hover:shadow-sky-200">
          <h2 className="text-2xl font-bold text-center text-sky-800 mb-6">
            {isLogin ? "Login to Your Account" : "Create a New Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                value={formData.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              value={formData.email}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              required
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                value={formData.confirmPassword}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                required
              />
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-sky-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] transition-transform duration-300"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-sky-700 font-semibold hover:underline"
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </p>

          {isLogin && (
            <p className="text-center mt-3 text-sm text-gray-500">
              Forgot your password?{" "}
              <Link
                to="/forgot-password"
                className="text-sky-700 font-semibold hover:underline"
              >
                Click here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
