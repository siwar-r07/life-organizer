import React, { useState, useEffect } from "react";
import api from "./api";
import { enablePushNotifications } from "./pushNotifications";
import {
  User,
  Lock,
  Bell,
  Camera,
  Palette,
  LogOut,
  ChevronRight,
  Mail,
  ShieldCheck,
  Moon,
  CalendarDays,
  CheckSquare,
  Flame,
  Sun,
} from "lucide-react";

function Settings() {
    const [profile, setProfile] = useState(null);
    useEffect(() => {
  const handleProfileUpdate = (event) => {
    if (event.detail) {
      setProfile(event.detail);
    }
  };

  window.addEventListener("profileUpdated", handleProfileUpdate);

  return () => {
    window.removeEventListener("profileUpdated", handleProfileUpdate);
  };
}, []);
    const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

const changeTheme = (theme) => {
  const isDark = theme === "dark";

  setDarkMode(isDark);
  localStorage.setItem("theme", theme);

document.documentElement.classList.toggle("dark-mode", isDark);

console.log("Theme clicked:", theme);
console.log("Dark mode active:", document.documentElement.classList.contains("dark-mode"));
};
const [editingProfile, setEditingProfile] = useState(false);
const [showPasswordForm, setShowPasswordForm] = useState(false);
const [profileUsername, setProfileUsername] = useState("");
const [profileBio, setProfileBio] = useState("");
const [savingProfile, setSavingProfile] = useState(false);
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [changingPassword, setChangingPassword] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");
// EMAIL CHANGE
const [showEmailForm, setShowEmailForm] = useState(false);
const [newEmail, setNewEmail] = useState("");
const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
const [changingEmail, setChangingEmail] = useState(false);
const [emailError, setEmailError] = useState("");
const [emailSuccess, setEmailSuccess] = useState("");
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/profile");
     console.log("PROFILE DATA:", response.data);
setProfile(response.data);
setProfileUsername(response.data.username || "");
setProfileBio(response.data.bio || "");
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error.response?.data || error.message
      );
    }
  };

  fetchProfile();
}, []);
const saveProfile = async () => {
  try {
    setSavingProfile(true);

    const response = await api.put("/api/profile", {
      username: profileUsername,
      bio: profileBio
    });

    setProfile(response.data);

    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
    );
window.dispatchEvent(
  new CustomEvent("profileUpdated", {
    detail: response.data,
  })
);
    setEditingProfile(false);

  } catch (error) {
    console.error(
      "Error updating profile:",
      error.response?.data || error.message
    );
  } finally {
    setSavingProfile(false);
  }
};
const changePassword = async () => {
  setPasswordError("");
  setPasswordSuccess("");

  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("New passwords do not match.");
    return;
  }

  try {
    setChangingPassword(true);

    const response = await api.put("/auth/request-password-change", {
  currentPassword,
  newPassword
});

    setPasswordSuccess("Confirmation email sent. Please check your email.");

    console.log(response.data);

  } catch (error) {
    setPasswordError(
      error.response?.data || "Something went wrong. Please try again."
    );
  } finally {
    setChangingPassword(false);
  }
};
const requestEmailChange = async () => {
  setEmailError("");
  setEmailSuccess("");

  if (!newEmail.trim() || !emailCurrentPassword) {
    setEmailError("Please fill in all fields.");
    return;
  }

  try {
    setChangingEmail(true);

    const response = await api.put("/auth/request-email-change", {
      newEmail,
      currentPassword: emailCurrentPassword
    });

    setEmailSuccess(
      "Verification email sent! Please check your new email address."
    );

    setNewEmail("");
    setEmailCurrentPassword("");

  } catch (error) {
    setEmailError(
      error.response?.data?.message ||
      "Could not request email change. Please try again."
    );
  } finally {
    setChangingEmail(false);
  }
};
const handleProfilePictureChange = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.put(
      "/api/profile/picture",
      formData
    );

   setProfile(response.data);

localStorage.setItem(
  "user",
  JSON.stringify(response.data)
);

window.dispatchEvent(
  new CustomEvent("profileUpdated", {
    detail: response.data,
  })
);

  } catch (error) {
    console.error(
      "Error uploading profile picture:",
      error.response?.data || error.message
    );
  }
};
  const [activeSection, setActiveSection] = useState("profile");

 const [showPushPopup, setShowPushPopup] = useState(false);
const [notifications, setNotifications] = useState(() => {
  const defaults = {
    tasks: true,
    events: true,
    habits: true,
    daily: false,
  };

  try {
    const saved = JSON.parse(
      localStorage.getItem("notificationSettings")
    );

    return { ...defaults, ...(saved || {}) };
  } catch {
    return defaults;
  }
});

useEffect(() => {
  const syncNotifications = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("notificationSettings")
      );

      if (saved) {
        setNotifications((prev) => ({
          ...prev,
          ...saved,
        }));
      }
    } catch {
      // Keep the current settings if saved data is invalid.
    }
  };

  window.addEventListener(
    "notificationSettingsChanged",
    syncNotifications
  );

  return () => {
    window.removeEventListener(
      "notificationSettingsChanged",
      syncNotifications
    );
  };
}, []);

const toggleNotification = async (name) => {
  const nextValue = !notifications[name];

  // Ask for confirmation before enabling task notifications
  if (name === "tasks" && nextValue) {
    setShowPushPopup(true);
    return;
  }

  try {
    if (name === "tasks") {
      await api.put("/api/notifications/tasks-preference", {
        enabled: false,
      });
    }

    const updated = {
      ...notifications,
      [name]: nextValue,
    };

    setNotifications(updated);

    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new Event("notificationSettingsChanged")
    );
  } catch (error) {
    console.error("NOTIFICATION SETTING ERROR:", error);
    alert(error.response?.data?.message || error.message);
  }
};
const confirmPushNotifications = async () => {
  try {
    await enablePushNotifications();

    await api.put("/api/notifications/tasks-preference", {
      enabled: true,
    });

    const updated = {
      ...notifications,
      tasks: true,
    };

    setNotifications(updated);

    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new Event("notificationSettingsChanged")
    );

    setShowPushPopup(false);
  } catch (error) {
    console.error("PUSH NOTIFICATION ERROR:", error);

    alert(
      error.response?.data?.message ||
      error.message ||
      "Could not enable notifications."
    );
  }
};
  const sections = [
    {
      id: "profile",
      label: "Profile",
      description: "Personal information",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      description: "Password & account",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Manage reminders",
      icon: Bell,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme & display",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-purple-500 font-medium mb-1">
            Customize your space
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your account and personalize your Life Organizer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 h-fit">

            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition ${
                    active
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      active
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="flex-1">
             <p
  className="font-semibold text-sm"
  style={{ color: activeSection === section.id ? "#9333ea" : "#4b5563" }}
>
  {section.label}
</p>

<p
  className="text-xs mt-0.5"
  style={{ color: activeSection === section.id ? "#a855f7" : "#6b7280" }}
>
  {section.description}
</p>
                  </div>

                  <ChevronRight size={16} />
                </button>
              );
            })}

           
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">

            {/* PROFILE */}
            {activeSection === "profile" && (
              <div className="space-y-6">

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Profile
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        Manage your personal information.
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                      <User size={22} />
                    </div>
                  </div>

                 <div
  className="flex items-center gap-5 p-5 rounded-2xl"
  style={{
    background: darkMode
      ? "linear-gradient(to right, rgba(147,51,234,0.18), rgba(236,72,153,0.10))"
      : "linear-gradient(to right, #faf5ff, #fdf2f8)",
    border: darkMode
      ? "1px solid rgba(168,85,247,0.25)"
      : "1px solid transparent",
  }}
>
  <div className="relative">
    {profile?.profilePicture ? (
      <img
        src={profile.profilePicture}
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover"
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 text-xl font-bold">
        {profile?.username?.charAt(0)?.toUpperCase() || "U"}
      </div>
    )}

    <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer shadow-sm hover:text-purple-600 transition">
      <Camera size={15} strokeWidth={2} />
      <input
        type="file"
        accept="image/*"
        onChange={handleProfilePictureChange}
        className="hidden"
      />
    </label>
  </div>

  <div>
    <h3
      className="font-bold"
      style={{ color: darkMode ? "#f3f4f6" : "#1f2937" }}
    >
      Your Profile
    </h3>
    <p
      className="text-sm"
      style={{ color: darkMode ? "#9ca3af" : "#6b7280" }}
    >
      Update your information from the profile page.
    </p>
  </div>

  <button
    onClick={() => setEditingProfile(!editingProfile)}
    className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold transition"
    style={{
      backgroundColor: darkMode ? "rgba(168,85,247,0.2)" : "#ffffff",
      color: darkMode ? "#d8b4fe" : "#9333ea",
      border: darkMode
        ? "1px solid rgba(168,85,247,0.4)"
        : "1px solid transparent",
    }}
  >
    {editingProfile ? "Cancel" : "Edit Profile"}
  </button>
</div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">

                    <div className="p-4 rounded-2xl bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <User size={16} />
                        <span className="text-xs font-medium">
                          Full name
                        </span>
                      </div>

                     {editingProfile ? (
  <input
    type="text"
    value={profileUsername}
    onChange={(e) => setProfileUsername(e.target.value)}
    className="w-full px-3 py-2 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
    placeholder="Your username"
  />
) : (
  <p className="font-semibold text-gray-700">
    {profile?.username || "Your name"}
  </p>
)}
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Mail size={16} />
                        <span className="text-xs font-medium">
                          Email
                        </span>
                      </div>

                     <p className="font-semibold text-gray-700">
  {profile?.email || "Your email"}
</p>
<button
  onClick={() => {
    setShowEmailForm(!showEmailForm);
    setEmailError("");
    setEmailSuccess("");
  }}
  className="mt-3 text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
>
  {showEmailForm ? "Cancel" : "Change Email"}
</button>
{showEmailForm && (
  <div className="mt-4 space-y-3">
    <input
      type="email"
      value={newEmail}
      onChange={(e) => setNewEmail(e.target.value)}
      placeholder="Enter your new email"
      className="w-full rounded-xl border border-purple-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
    />

    <input
      type="password"
      value={emailCurrentPassword}
      onChange={(e) => setEmailCurrentPassword(e.target.value)}
      placeholder="Enter your current password"
      className="w-full rounded-xl border border-purple-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
    />

    {emailError && (
      <p className="text-sm text-red-500">{emailError}</p>
    )}

    {emailSuccess && (
      <p className="text-sm text-green-600">{emailSuccess}</p>
    )}

    <button
      onClick={requestEmailChange}
      disabled={changingEmail}
      className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
    >
      {changingEmail ? "Sending..." : "Send Verification Email"}
    </button>
  </div>
)}
                    </div>
                  </div>
                  {editingProfile && (
  <div className="mt-4 p-4 rounded-2xl bg-purple-50">
    <label className="text-xs font-medium text-gray-500">
      Bio
    </label>

    <textarea
      value={profileBio}
      onChange={(e) => setProfileBio(e.target.value)}
      rows="3"
      className="w-full mt-2 px-3 py-2 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
      placeholder="Tell us a little about yourself..."
    />

    <button
      onClick={saveProfile}
      disabled={savingProfile}
      className="mt-3 px-5 py-2 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50"
    >
      {savingProfile ? "Saving..." : "Save Changes"}
    </button>
  </div>
)}
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-500" />
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Account protected
                      </h3>

                      <p className="text-sm text-gray-400">
                        Your account security settings are up to date.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Security
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Keep your account safe and secure.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Lock size={22} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="flex gap-3">
                    <ShieldCheck className="text-blue-500 mt-0.5" />

                    <div>
                      <h3 className="font-semibold text-blue-800">
                        Password security
                      </h3>

                      <p className="text-sm text-blue-600 mt-1">
                        Password changes will require additional
                        security verification.
                      </p>
                    </div>
                  </div>
                </div>

               <button
  onClick={() => setShowPasswordForm(!showPasswordForm)}
  className="mt-6 w-full flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition"
>
  <div className="flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
      <Lock size={18} />
    </div>

    <div className="text-left">
      <p className="font-semibold text-gray-700">
        Change password
      </p>

      <p className="text-sm text-gray-400">
        Update your account password
      </p>
    </div>
  </div>

  <ChevronRight
    size={18}
    className={`text-gray-400 transition-transform ${
      showPasswordForm ? "rotate-90" : ""
    }`}
  />
</button>
{showPasswordForm && (
  <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">

    <div className="space-y-4">
{passwordError && (
  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
    {passwordError}
  </div>
)}

{passwordSuccess && (
  <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-600">
    {passwordSuccess}
  </div>
)}
      <div>
        <label className="text-xs font-medium text-gray-500">
          Current password
        </label>

        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
          placeholder="Enter current password"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">
          New password
        </label>

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">
          Confirm new password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
          placeholder="Confirm new password"
        />
      </div>

     <button
  onClick={changePassword}
  disabled={changingPassword}
  className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50"
>
  {changingPassword ? "Changing..." : "Change Password"}
</button>

    </div>
  </div>
)}

              </div>
              
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Notifications
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Choose what you want to be reminded about.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                    <Bell size={22} />
                  </div>
                </div>

                <div className="space-y-3">

                  <NotificationRow
                    icon={CheckSquare}
                    title="Task reminders"
                    description="Get reminded about your tasks"
                    enabled={notifications.tasks}
                    onClick={() => toggleNotification("tasks")}
                  />

                  <NotificationRow
                    icon={CalendarDays}
                    title="Event reminders"
                    description="Never miss an upcoming event"
                    enabled={notifications.events}
                    onClick={() => toggleNotification("events")}
                  />

                  <NotificationRow
                    icon={Flame}
                    title="Habit reminders"
                    description="Keep your daily streak alive"
                    enabled={notifications.habits}
                    onClick={() => toggleNotification("habits")}
                  />

                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeSection === "appearance" && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Appearance
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Make your workspace feel like yours.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500">
                    <Palette size={22} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">

               {/* LIGHT MODE */}
<button
  onClick={() => changeTheme("light")}
  className={`p-5 rounded-2xl border-2 text-left transition ${
    !darkMode
      ? "border-purple-300 bg-purple-50"
      : "border-gray-200 bg-white"
  }`}
>
  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-purple-500 mb-4 shadow-sm">
    <Sun size={20} />
  </div>

  <p className="font-bold text-gray-800">Light</p>

  <p className="text-sm text-gray-400 mt-1">
    Clean and bright
  </p>
</button>

{/* DARK MODE */}
<button
  onClick={() => changeTheme("dark")}
  className={`p-5 rounded-2xl border-2 text-left transition ${
    darkMode
      ? "border-purple-400 bg-gray-800"
      : "border-gray-200 bg-white hover:bg-gray-50"
  }`}
>
  <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center text-white mb-4">
    <Moon size={20} />
  </div>

  <p className={`font-bold ${
    darkMode ? "text-white" : "text-gray-800"
  }`}>
    Dark
  </p>

  <p className="text-sm text-gray-400 mt-1">
    Easy on the eyes
  </p>
</button>
                </div>

              </div>
            )}

          </div>
        </div>
       </div>

      {/* PUSH NOTIFICATION POPUP */}
      {showPushPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="bg-white w-full max-w-md rounded-3xl p-7 shadow-2xl text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-5">
              <Bell size={30} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Stay on top of your tasks!
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              Allow Life Organizer to send you notifications so you never miss an important reminder.
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setShowPushPopup(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Not now
              </button>

              <button
                onClick={confirmPushNotifications}
                className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition"
              >
                Enable notifications
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function NotificationRow({
  icon: Icon,
  title,
  description,
  enabled,
  onClick,
}) {
  const darkMode = document.documentElement.classList.contains("dark-mode");

  const trackColor = enabled
    ? "#a855f7"
    : darkMode
    ? "#4b5563"
    : "#e5e7eb";

  const knobColor = enabled ? "#ffffff" : darkMode ? "#d1d5db" : "#ffffff";

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 transition">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
          <Icon size={18} />
        </div>

        <div>
          <p className="font-semibold text-gray-700">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onClick}
        style={{
          width: 48,
          height: 28,
          borderRadius: 9999,
          padding: 4,
          backgroundColor: trackColor,
          border: enabled ? "1px solid #c084fc" : "1px solid #6b7280",
          transition: "background-color 0.2s",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: knobColor,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            transform: enabled ? "translateX(20px)" : "translateX(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>
    </div>
  );
}

export default Settings;