import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Zap } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-gray-900 dark:text-gray-100 px-5 py-4 border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 flex justify-between items-center transition-colors duration-300">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand/20">
          <Zap className="text-white w-5 h-5 fill-white/10" size={20} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">FanFlow</h1>
      </div>
      
      {user && (
        <button 
          onClick={logout} 
          aria-label="Logout" 
          className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-gray-100 dark:focus:ring-white/5 active:scale-95"
        >
          Logout
        </button>
      )}
    </header>
  );
};


export default Header;
