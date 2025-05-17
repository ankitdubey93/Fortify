import { Link } from "react-router-dom";
import React from "react";

interface DashboardNavbarProps {
  name: string;
  onSignOut: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  name,
  onSignOut,
}) => {
  return (
    <nav className="bg-sky-300  py-4 px-2 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold">
          <Link to="/">Fortify</Link>
        </div>
        <div>
          <h1 className="text-xl font-bold text-sky-600">
            Welcome test, hello ankit snow {name}
          </h1>
        </div>
      </div>
      <div className="space-x-6 flex items-center">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/account" className="hover:underline">
          Account
        </Link>
        <button
          onClick={onSignOut}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
