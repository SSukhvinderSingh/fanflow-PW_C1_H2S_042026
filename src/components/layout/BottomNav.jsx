import React from "react";
import { NavLink } from "react-router-dom";
import { Map, Clock, Coffee, Navigation } from "lucide-react";

const BottomNav = () => {
  const navItems = [
    { to: "/map", icon: Map, label: "Map" },
    { to: "/waittimes", icon: Clock, label: "Wait" },
    { to: "/order", icon: Coffee, label: "Order" },
    { to: "/exit", icon: Navigation, label: "Exit" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={`Go to ${label}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand ${
                isActive ? "text-brand" : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <Icon size={24} aria-hidden="true" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
