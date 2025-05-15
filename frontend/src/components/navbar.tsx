import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-sky-300 shadow-md py-4 px-2 flex items-center">
      <div className="space-x-10 mx-auto">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>
        <Link to="/auth" className="text-gray-700 hover:text-blue-600">
          Sign In / Sign Up
        </Link>
        <Link to="/about" className="text-gray-700 hover:text-blue-600">
          About
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
