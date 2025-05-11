import logo from "../assets/logo.png";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex flex-col items-center justify-center text-center mt-2 px-4">
        <img src={logo} alt="Fortify Logo" className="w-80 h-80 mb-6" />
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Fortify
        </h2>
        <p className="text-lg text-gray-700 max-w-xl">
          Fortify is your secure companion for managing passwords. Powered by
          modern encryption using Node.js's <code>crypto</code> module,{" "}
          <code>bcrypt</code> for secure authentication, and MongoDB for storage
          — your credentials stay protected and private.
        </p>
      </div>
    </motion.div>
  );
};

export default HomePage;
