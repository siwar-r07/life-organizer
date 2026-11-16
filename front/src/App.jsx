import React, { useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import ConfirmPasswordChange from "./ConfirmPasswordChange";
import ResetPassword from "./ResetPassword";
import ConfirmEmailChange from "./ConfirmEmailChange";
import ProtectedRoute from "./ProtectedRoute";
import Tasks from "./Tasks";
import CalendarPage from "./CalendarPage";
import Notes from "./Notes";
import AppLayout from "./AppLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./App.css";


function App() {
  useEffect(() => {
  const savedTheme = localStorage.getItem("theme");

  document.documentElement.classList.toggle(
    "dark-mode",
    savedTheme === "dark"
  );
}, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route
          path="/confirm-password-change/:token"
          element={<ConfirmPasswordChange />}
        />
        <Route path="/reset/:token" element={<ResetPassword />} />
<Route
  path="/confirm-email-change/:token"
  element={<ConfirmEmailChange />}
/>
      
{/* Protected routes */}
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
  <Route path="/calendar" element={<CalendarPage />} />
<Route path="/notes" element={<Notes />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/tasks" element={<Tasks />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
