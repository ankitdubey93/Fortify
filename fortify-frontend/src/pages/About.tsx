import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.1 }}
    >
      <div className="max-w-3xl mx-auto mt-16 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About Fortify</h1>
        <p className="text-lg text-gray-700">
          Fortify is an open-source password manager designed with security in
          mind. Built with Node.js, TypeScript, MongoDB, and secure hashing
          techniques, Fortify ensures your data is safe from end to end.
        </p>
      </div>
    </motion.div>
  );
};

export default AboutPage;
