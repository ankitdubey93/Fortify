import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center text-center p-6">
      <h1 className="text-4xl font-bold text-sky-700 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-sky-700 hover:bg-sky-800 text-white px-6 py-2 rounded transition-colors duration-200"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
