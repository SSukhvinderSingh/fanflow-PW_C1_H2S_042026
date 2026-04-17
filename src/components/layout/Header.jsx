import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-brand text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center bg-blue-900">
      <h1 className="text-xl font-bold">FanFlow</h1>
      {user && (
        <button onClick={logout} aria-label="Logout" className="text-sm font-medium border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white transition">
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
