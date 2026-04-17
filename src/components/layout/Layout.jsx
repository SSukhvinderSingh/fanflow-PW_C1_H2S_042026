import React from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";

const Layout = ({ children }) => {
  return (
    <div className="pb-16 min-h-screen bg-gray-50 flex flex-col relative w-full">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-brand focus:font-bold">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-grow w-full focus:outline-none" tabIndex="-1">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
