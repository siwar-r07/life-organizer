
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-white text-purple-700 shadow-md md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile background overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}

export default AppLayout;
