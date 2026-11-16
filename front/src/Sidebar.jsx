
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  CheckSquare,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import api from "./api";

function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [profilePicture, setProfilePicture] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/profile");
      setUser(response.data);
      setProfilePicture(response.data.profilePicture || "");
      setProfileUsername(response.data.username || "");
      setProfileBio(response.data.bio || "");
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  fetchProfile();

  const handleProfileUpdate = (event) => {
    const updatedUser = event.detail;
    if (!updatedUser) return;

    setUser(updatedUser);
    setProfilePicture(updatedUser.profilePicture || "");
    setProfileUsername(updatedUser.username || "");
    setProfileBio(updatedUser.bio || "");
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  window.addEventListener("profileUpdated", handleProfileUpdate);

  return () => {
    window.removeEventListener("profileUpdated", handleProfileUpdate);
  };
}, []);


  const saveProfile = async () => {
    try {
      setSavingProfile(true);

      const response = await api.put("/api/profile", {
        username: profileUsername,
        bio: profileBio,
      });

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProfilePicture(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await api.put("/api/profile/picture", formData);
      window.dispatchEvent(
  new CustomEvent("profileUpdated", {
    detail: response.data,
  })
);
      setProfilePicture(response.data.profilePicture);
setUser(response.data);

localStorage.setItem("user", JSON.stringify(response.data));

window.dispatchEvent(
  new CustomEvent("profileUpdated", {
    detail: response.data,
  })
);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center ${
      isCollapsed ? "justify-center px-3" : "gap-3 px-4"
    } py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
    }`;

  return (
    <aside
     className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64
  shrink-0 flex-col overflow-x-hidden overflow-y-auto
  bg-white p-5 shadow-lg
  transition-[width,padding,transform] duration-300 ease-in-out
  md:relative md:inset-auto md:translate-x-0
  ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
  ${isCollapsed ? "md:w-20 md:p-3" : "md:w-64 md:p-5"}`}
    >
      {/* Sidebar header and toggle */}
      <div
        className={`mb-6 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
       {!isCollapsed && (
  <div className="flex items-center gap-2">
    <Sparkles size={16} style={{ color: "#a855f7" }} />

    <h1
      className="whitespace-nowrap text-base font-extrabold tracking-tight"
      style={{
        background: "linear-gradient(90deg, #a855f7, #ec4899)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Life Organizer
    </h1>
  </div>
)}

        <button
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-10 w-10 shrink-0 items-center justify-center
                     rounded-xl text-gray-500 transition
                     hover:bg-purple-50 hover:text-purple-700"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={21} />
          ) : (
            <PanelLeftClose size={21} />
          )}
        </button>
      </div>

{/* Profile */}
<div
  className={`mb-6 flex ${
    isCollapsed ? "justify-center" : "items-start gap-3"
  }`}
>
  <img
    src={
      profilePicture ||
      user?.profilePicture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.username || "User"
      )}`
    }
    alt="Profile"
    title={isCollapsed ? user?.username || "User" : undefined}
    className="h-12 w-12 shrink-0 rounded-full object-cover"
  />

  {!isCollapsed && (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-gray-800">
        {user?.username || "User"}
      </p>

      <p className="truncate text-xs text-gray-500">
        {user?.email || ""}
      </p>

      <p className="mt-1 break-words text-sm text-gray-600">
        {user?.bio || "No bio yet"}
      </p>
    </div>
  )}
</div>

      {/* Navigation */}
      {!isCollapsed && (
        <p className="mb-3 px-3 text-xs font-bold uppercase
                      tracking-widest text-gray-400">
          Workspace
        </p>
      )}

      <nav className="flex flex-col gap-3">
        <NavLink
          to="/dashboard"
          end
          onClick={onMobileClose}
          title={isCollapsed ? "Dashboard" : undefined}
          className={linkClass}
        >
          <Home size={18} />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/tasks"
          onClick={onMobileClose}
          title={isCollapsed ? "Tasks" : undefined}
          className={linkClass}
        >
          <CheckSquare size={18} />
          {!isCollapsed && <span>Tasks</span>}
        </NavLink>

        <NavLink
          to="/calendar"
          onClick={onMobileClose}
          title={isCollapsed ? "Calendar" : undefined}
          className={linkClass}
        >
          <Calendar size={18} />
          {!isCollapsed && <span>Calendar</span>}
        </NavLink>

        <NavLink
          to="/notes"
          onClick={onMobileClose}
          title={isCollapsed ? "Notes" : undefined}
          className={linkClass}
        >
          <FileText size={18} />
          {!isCollapsed && <span>Notes</span>}
        </NavLink>
      </nav>

      {/* Settings and logout */}
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <NavLink
          to="/settings"
          onClick={onMobileClose}
          title={isCollapsed ? "Settings" : undefined}
          className={linkClass}
        >
          <Settings size={18} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center rounded-xl py-3 text-left
                      text-red-500 transition hover:bg-red-50
            ${isCollapsed ? "justify-center px-3" : "gap-3 px-4"}`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
