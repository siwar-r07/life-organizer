import React, { useState, useEffect, useRef } from "react";
import api from "./api";
import { Bell, Search, Home, CheckSquare, Calendar, FileText, Settings, LogOut, Plus, Heart, Droplet, Dumbbell, BookOpen, Moon, Flame, TrendingUp  } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
const [tasks, setTasks] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [newTask, setNewTask] = useState("");
const [taskPriority, setTaskPriority] = useState("medium");
const [showMobileSearch, setShowMobileSearch] = useState(false);
const mobileSearchRef = useRef(null);

useEffect(() => {
  if (showMobileSearch) {
    mobileSearchRef.current?.focus();
  }
}, [showMobileSearch]);
useEffect(() => {
  fetchTasks();
    fetchNotes();
    fetchProfile();
fetchEvents();
 fetchHabits();
}, []);
useEffect(() => {
  const updateTaskNotifications = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("taskReminderNotifications") || "[]"
      );

      setTaskReminderNotifications(saved);
    } catch {
      setTaskReminderNotifications([]);
    }
  };

  const handleTaskReminder = () => {
    updateTaskNotifications();
  };

  window.addEventListener(
    "taskReminderCreated",
    handleTaskReminder
  );
window.addEventListener(
  "taskReminderDeleted",
  handleTaskReminder
);

  window.addEventListener("storage", updateTaskNotifications);

  updateTaskNotifications();

  return () => {
    window.removeEventListener(
      "taskReminderCreated",
      handleTaskReminder
    );
    window.removeEventListener("taskReminderDeleted", handleTaskReminder);
    window.removeEventListener("storage", updateTaskNotifications);
  };
}, []);
useEffect(() => {
  const checkTaskReminder = (task) => {
    if (!task._id || task.done || !task.createdAt) return;

    let settings = {};

    try {
      settings =
        JSON.parse(localStorage.getItem("notificationSettings")) || {};
    } catch {
      return;
    }

    if (settings.tasks !== true) return;
if (localStorage.getItem(`taskDeleted-${task._id}`) === "true") {
  return;
}
    const reminderKey = `taskReminderSent-${task._id}`;

    if (localStorage.getItem(reminderKey) === "true") return;

    const createdTime = new Date(task.createdAt).getTime();

    if (Number.isNaN(createdTime)) return;

    const reminderTime = createdTime + 2 * 60 * 60 * 1000;
    const remainingTime = reminderTime - Date.now();

    if (remainingTime > 0) return;

    localStorage.setItem(reminderKey, "true");

    const notification = {
      id: `task-reminder-${task._id}`,
      type: "task",
      title: task.text,
      message: "This task is still unfinished. Don't forget to complete it!",
      createdAt: new Date().toISOString(),
    };

    let savedNotifications = [];

    try {
      savedNotifications = JSON.parse(
        localStorage.getItem("taskReminderNotifications") || "[]"
      );
    } catch {
      savedNotifications = [];
    }

    savedNotifications = savedNotifications.filter(
      (item) => item.id !== notification.id
    );

    savedNotifications.unshift(notification);

    localStorage.setItem(
      "taskReminderNotifications",
      JSON.stringify(savedNotifications)
    );

    window.dispatchEvent(
      new CustomEvent("taskReminderCreated", {
        detail: notification,
      })
    );

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("Task reminder 📝", {
        body: `"${task.text}" is still unfinished. Don't forget to complete it!`,
        tag: `task-reminder-${task._id}`,
      });
    }
  };

  const timers = tasks
    .map((task) => {
      if (task.done || !task.createdAt) return null;

      const reminderTime =
        new Date(task.createdAt).getTime() + 2 * 60 * 60 * 1000;

      const remainingTime = reminderTime - Date.now();

      if (remainingTime <= 0) {
        checkTaskReminder(task);
        return null;
      }

      return setTimeout(() => {
        checkTaskReminder(task);
      }, remainingTime);
    })
    .filter(Boolean);

  const checkAllTasks = () => {
    tasks.forEach(checkTaskReminder);
  };

  window.addEventListener("focus", checkAllTasks);
  window.addEventListener("notificationSettingsChanged", checkAllTasks);

  return () => {
    timers.forEach(clearTimeout);
    window.removeEventListener("focus", checkAllTasks);
    window.removeEventListener(
      "notificationSettingsChanged",
      checkAllTasks
    );
  };
}, [tasks]);
const [notes, setNotes] = useState([]);
const [events, setEvents] = useState([]);
const [habits, setHabits] = useState([]);
const [newHabit, setNewHabit] = useState("");
const [habitColor, setHabitColor] = useState("purple");
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(null);
const [selectedDayEvents, setSelectedDayEvents] = useState([]);
const [eventTitle, setEventTitle] = useState("");
const [eventDescription, setEventDescription] = useState("");
const [eventColor, setEventColor] = useState("purple");
const [showNoteEditor, setShowNoteEditor] = useState(false);
const [user, setUser] = useState(null);
const [editingProfile, setEditingProfile] = useState(false);
const [profileUsername, setProfileUsername] = useState("");
const [profileBio, setProfileBio] = useState("");
const [savingProfile, setSavingProfile] = useState(false);
const [profilePicture, setProfilePicture] = useState("");
const [noteTitle, setNoteTitle] = useState("");
const [noteContent, setNoteContent] = useState("");
const [noteColor, setNoteColor] = useState("purple");
const [noteSearch, setNoteSearch] = useState("");
const [showNotifications, setShowNotifications] = useState(false);
const [taskReminderNotifications, setTaskReminderNotifications] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("taskReminderNotifications") || "[]"
    );
  } catch {
    return [];
  }
});
const [habitReminderNotifications, setHabitReminderNotifications] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("habitReminderNotifications") || "[]"
    );
  } catch {
    return [];
  }
});
useEffect(() => {
  const loadHabitReminders = () => {
    try {
      setHabitReminderNotifications(
        JSON.parse(
          localStorage.getItem("habitReminderNotifications") || "[]"
        )
      );
    } catch {
      setHabitReminderNotifications([]);
    }
  };

  const handleHabitReminderCreated = () => {
    loadHabitReminders();
  };

  window.addEventListener(
    "habitReminderCreated",
    handleHabitReminderCreated
  );

  window.addEventListener("storage", loadHabitReminders);

  loadHabitReminders();

  return () => {
    window.removeEventListener(
      "habitReminderCreated",
      handleHabitReminderCreated
    );

    window.removeEventListener("storage", loadHabitReminders);
  };
}, []);


useEffect(() => {
  let reminderTimer;

  const getTodayKey = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const sendHabitReminders = () => {
    let settings = {};

    try {
      settings = JSON.parse(
        localStorage.getItem("notificationSettings") || "{}"
      );
    } catch {
      return;
    }

    if (settings.habits !== true) return;

    const today = getTodayKey();
    const sentKey = `habitReminderSent-${today}`;

    if (localStorage.getItem(sentKey) === "true") return;

    const incompleteHabits = habits.filter(
      (habit) => !habit.completedDates?.includes(today)
    );

    if (incompleteHabits.length === 0) return;

    // Prevent duplicate reminders.
    localStorage.setItem(sentKey, "true");

    const newNotifications = incompleteHabits.map((habit) => ({
      id: `habit-reminder-${habit._id}-${today}`,
      type: "habit",
      title: habit.name,
      message: "You haven't completed this habit today. Keep your streak going! 💜",
      createdAt: new Date().toISOString(),
    }));

    let savedNotifications = [];

    try {
      savedNotifications = JSON.parse(
        localStorage.getItem("habitReminderNotifications") || "[]"
      );
    } catch {
      savedNotifications = [];
    }

    const updatedNotifications = [
      ...newNotifications.filter(
        (notification) =>
          !savedNotifications.some(
            (item) => item.id === notification.id
          )
      ),
      ...savedNotifications,
    ];

    localStorage.setItem(
      "habitReminderNotifications",
      JSON.stringify(updatedNotifications)
    );

    setHabitReminderNotifications(updatedNotifications);

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("Habit Reminder 💜", {
        body: incompleteHabits.length === 1
          ? `Don't forget: ${incompleteHabits[0].name}`
          : `You have ${incompleteHabits.length} unfinished habits today!`,
        tag: `habit-reminder-${today}`,
      });
    }
  };

  const checkMissedReminder = () => {
    const now = new Date();
    const reminderTime = new Date(now);

    reminderTime.setHours(18, 0, 0, 0);

    if (now >= reminderTime) {
      sendHabitReminders();
    }
  };

  const scheduleReminder = () => {
    clearTimeout(reminderTimer);

    const now = new Date();
    const nextReminder = new Date(now);

    nextReminder.setHours(18, 0, 0, 0);

    if (now >= nextReminder) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    const delay = nextReminder.getTime() - now.getTime();

    reminderTimer = setTimeout(() => {
      sendHabitReminders();
      scheduleReminder();
    }, delay);
  };

  // Check for a missed reminder when Dashboard opens.
  checkMissedReminder();

  // Schedule the next daily reminder.
  scheduleReminder();

  const handleReturn = () => {
    checkMissedReminder();
    scheduleReminder();
  };

  window.addEventListener("focus", handleReturn);
  window.addEventListener(
    "notificationSettingsChanged",
    handleReturn
  );

  return () => {
    clearTimeout(reminderTimer);

    window.removeEventListener("focus", handleReturn);
    window.removeEventListener(
      "notificationSettingsChanged",
      handleReturn
    );
  };
}, [habits]);

const [showProfileMenu, setShowProfileMenu] = useState(false);
const [readNotifications, setReadNotifications] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("readNotifications") || "[]"
    );
  } catch {
    return [];
  }
});
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const formattedToday = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const hour = new Date().getHours();
const greeting =
  hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
const completedHabitsToday = habits.filter((habit) =>
  habit.completedDates?.includes(today)
).length;

const totalHabits = habits.length;


const todaysTasks = tasks.filter((task) => {
  const createdToday =
    task.createdAt &&
    new Date(task.createdAt).toLocaleDateString("en-CA") === today;

const completedToday = (task.completionHistory || []).some(
  (date) => {
    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date === today;
    }

    return (
      new Date(date).toLocaleDateString("en-CA") === today
    );
  }
);

  return createdToday || !task.done || completedToday;
});

const completedTasks = todaysTasks.filter(
  (task) => task.done === true
).length;

const totalTasks = todaysTasks.length;
const totalDailyItems = totalTasks + totalHabits;
const completedDailyItems =
  completedTasks + completedHabitsToday;

const todaysProgress =
  totalDailyItems === 0
    ? 0
    : Math.round(
        (completedDailyItems / totalDailyItems) * 100
      );
      const tasksLeft = totalTasks - completedTasks;
const habitsLeft = totalHabits - completedHabitsToday;

const timeEmoji = hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙";

const headline =
  totalDailyItems === 0
    ? "Ready for a great day"
    : todaysProgress === 100
    ? "Hi"
    : "Hi";

const summary =
  totalDailyItems === 0
    ? "Add a task or a habit to get started"
    : todaysProgress === 100
    ? "Great job, keep shining ✨"
    : `${tasksLeft} ${tasksLeft === 1 ? "task" : "tasks"} and ${habitsLeft} ${
        habitsLeft === 1 ? "habit" : "habits"
      } left, you're doing great`;
const fetchProfile = async () => {
  try {
    const response = await api.get("/api/profile");

    setUser(response.data);
    setProfilePicture(response.data.profilePicture || "");
setProfileUsername(response.data.username || "");
setProfileBio(response.data.bio || "");
    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
    );

  } catch (error) {
    console.error(
      "Error fetching profile:",
      error.response?.data || error.message
    );
  }
};
const saveProfile = async () => {

  try {

    setSavingProfile(true);

    const response = await api.put("/api/profile", {
      username: profileUsername,
      bio: profileBio
    });

    setUser(response.data);

    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
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
const handleProfilePictureChange = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  try {

    // Show image immediately
    const previewUrl = URL.createObjectURL(file);
    setProfilePicture(previewUrl);

    // Prepare image for backend
    const formData = new FormData();

    formData.append("profilePicture", file);

    // Upload image
    const response = await api.put(
      "/api/profile/picture",
      formData
    );

    // Use permanent URL from backend
    setProfilePicture(response.data.profilePicture);
    setUser(response.data);

    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
    );

  } catch (error) {

    console.error(
      "Error uploading profile picture:",
      error.response?.data || error.message
    );

  }

};
const fetchTasks = async () => {
  try {
    const response = await api.get("/api/tasks");

    setTasks(response.data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};
const fetchNotes = async () => {
  try {
    const response = await api.get("/api/notes");
    setNotes(response.data);
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
};

const upcomingEvents = events
  .filter((event) => {
    if (!event.date || event.completed === true) return false;

    const eventDate = new Date(event.date);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return !Number.isNaN(eventDate.getTime()) &&
      eventDate >= startOfToday;
  })
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 4);

const notificationItems = [
  ...upcomingEvents.map((event) => ({
    id: `event-${event._id}`,
    type: "event",
    title: event.title,
    message: new Date(event.date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  })),
  ...taskReminderNotifications,
  ...habitReminderNotifications,
];
const unreadCount = notificationItems.filter(
  (item) => !readNotifications.includes(item.id)
).length;

const markAllAsRead = () => {
  const allIds = notificationItems.map((item) => item.id);
  const updatedReadNotifications = [
    ...new Set([...readNotifications, ...allIds]),
  ];

  setReadNotifications(updatedReadNotifications);

  localStorage.setItem(
    "readNotifications",
    JSON.stringify(updatedReadNotifications)
  );
};
const markAsRead = (id) => {
  const updatedReadNotifications = [
    ...new Set([...readNotifications, id]),
  ];

  setReadNotifications(updatedReadNotifications);

  localStorage.setItem(
    "readNotifications",
    JSON.stringify(updatedReadNotifications)
  );
};
const globalQuery = searchQuery.trim().toLowerCase();

const filteredTasks = tasks.filter((task) =>
  (task.text || "").toLowerCase().includes(globalQuery)
);

const filteredHabits = habits.filter((habit) =>
  (habit.name || "").toLowerCase().includes(globalQuery)
);

const filteredUpcomingEvents = upcomingEvents.filter((event) =>
  (event.title || "").toLowerCase().includes(globalQuery)
);

const fetchEvents = async () => {
  try {
    const response = await api.get("/api/events");
    setEvents(response.data);
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};
const fetchHabits = async () => {
  try {
    const response = await api.get("/api/habits");
    setHabits(response.data);
  } catch (error) {
    console.error(
      "Error fetching habits:",
      error.response?.data || error.message
    );
  }
};
const getHabitStreak = (completedDates = []) => {
  if (completedDates.length === 0) return 0;

  const dates = [...completedDates].sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    const expected = expectedDate
      .toISOString()
      .split("T")[0];

    if (dates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const getOverallStreak = () => {
  const completedDates = new Set();

  // Convert dates to YYYY-MM-DD without relying on another function.
  const toDateKey = (value) => {
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return value;
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return null;

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  };

  // Completed habit dates
  habits.forEach((habit) => {
    habit.completedDates?.forEach((date) => {
      const key = toDateKey(date);
      if (key) completedDates.add(key);
    });
  });

  // Completed task dates
  tasks.forEach((task) => {
    (task.completionHistory || []).forEach((date) => {
      const key = toDateKey(date);
      if (key) completedDates.add(key);
    });

    if (task.done && task.completedAt) {
      const key = toDateKey(task.completedAt);
      if (key) completedDates.add(key);
    }
  });

  let streak = 0;
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  while (completedDates.has(toDateKey(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
};


const overallStreak = getOverallStreak();
const addHabit = async () => {
  if (!newHabit.trim()) return;

  try {
    const response = await api.post("/api/habits", {
      name: newHabit.trim(),
      color: habitColor
    });

    setHabits((prev) => [response.data, ...prev]);

    setNewHabit("");
    setHabitColor("purple");
  } catch (error) {
    console.error(
      "Error adding habit:",
      error.response?.data || error.message
    );
  }
};


const toggleHabit = async (id) => {
  try {
    const response = await api.put(`/api/habits/${id}/toggle`);

    setHabits((prev) =>
      prev.map((habit) =>
        habit._id === id ? response.data : habit
      )
    );

    // Check whether the habit is completed today.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const completedToday =
      response.data.completedDates?.includes(today);

    if (completedToday) {
      // Remove this habit's reminder from the notification bell.
      let savedNotifications = [];

      try {
        savedNotifications = JSON.parse(
          localStorage.getItem("habitReminderNotifications") || "[]"
        );
      } catch {
        savedNotifications = [];
      }

      const updatedNotifications = savedNotifications.filter(
        (item) => !item.id.startsWith(`habit-reminder-${id}-`)
      );

      localStorage.setItem(
        "habitReminderNotifications",
        JSON.stringify(updatedNotifications)
      );

      setHabitReminderNotifications(updatedNotifications);
    }

  } catch (error) {
    console.error(
      "Error toggling habit:",
      error.response?.data || error.message
    );
  }
};


const deleteHabit = async (id) => {
  try {
    await api.delete(`/api/habits/${id}`);

    // Remove the habit from the Dashboard.
    setHabits((prev) =>
      prev.filter((habit) => habit._id !== id)
    );

    // Remove its saved reminders.
    let savedNotifications = [];

    try {
      savedNotifications = JSON.parse(
        localStorage.getItem("habitReminderNotifications") || "[]"
      );
    } catch {
      savedNotifications = [];
    }

    const updatedNotifications = savedNotifications.filter(
      (item) => item.id.split("-")[2] !== id
    );

    localStorage.setItem(
      "habitReminderNotifications",
      JSON.stringify(updatedNotifications)
    );

    setHabitReminderNotifications(updatedNotifications);

    window.dispatchEvent(
      new Event("habitReminderCreated")
    );

  } catch (error) {
    console.error(
      "Error deleting habit:",
      error.response?.data || error.message
    );
  }
};
const addNote = async (title, content, color) => {
  try {
    const response = await api.post("/api/notes", {
      title,
      content,
      color,
    });

    setNotes((prev) => [response.data, ...prev]);
  } catch (error) {
    console.error("Error adding note:", error.response?.data);
  }
};
const updateNote = async (id, title, content, color) => {
  try {
    const response = await api.put(`/api/notes/${id}`, {
      title,
      content,
      color,
    });

    setNotes(
      notes.map((note) =>
        note._id === id ? response.data : note
      )
    );
  } catch (error) {
    console.error("Error updating note:", error);
  }
};
const deleteNote = async (id) => {
  try {
    await api.delete(`/api/notes/${id}`);

    setNotes(notes.filter((note) => note._id !== id));
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};
const addEvent = async () => {
  if (!eventTitle.trim() || !selectedDate) return;

  try {
    const response = await api.post("/api/events", {
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      date: selectedDate,
      color: eventColor
    });

    setEvents((prev) => [...prev, response.data]);

    setSelectedDayEvents((prev) => [
      ...prev,
      response.data
    ]);

    setEventTitle("");
    setEventDescription("");
    setEventColor("purple");

  } catch (error) {
    console.error(
      "Error adding event:",
      error.response?.data || error.message
    );
  }
};
const deleteEvent = async (id) => {
  try {
    await api.delete(`/api/events/${id}`);

    setEvents((prev) =>
      prev.filter((event) => event._id !== id)
    );

    setSelectedDayEvents((prev) =>
      prev.filter((event) => event._id !== id)
    );
  } catch (error) {
    console.error(
      "Error deleting event:",
      error.response?.data || error.message
    );
  }
};
const updateEvent = async (id, title, description, date, color) => {
  try {
    const response = await api.put(`/api/events/${id}`, {
      title,
      description,
      date,
      color
    });

    setEvents((prev) =>
      prev.map((event) =>
        event._id === id ? response.data : event
      )
    );
  } catch (error) {
    console.error(
      "Error updating event:",
      error.response?.data || error.message
    );
  }
};
const navigate = useNavigate();
const handleNotificationClick = (item) => {
  markAsRead(item.id);
  setShowNotifications(false);

const targetId =
  item.type === "event"
    ? "calendar-section"
    : item.type === "habit"
    ? "habits-section"
    : "tasks-section";

  document.getElementById(targetId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
const handleLogout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error(
      "Logout request failed:",
      error.response?.data || error.message
    );
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  }
};

const addTask = async () => {
  if (newTask.trim() === "") return;

  try {
    const response = await api.post("/api/tasks", {
      text: newTask,
        priority: taskPriority,
    });

    setTasks([response.data, ...tasks]);
    setNewTask("");
    setTaskPriority("medium");
  } catch (error) {
    console.error("Error adding task:", error);
  }
};
const deleteTask = async (id) => {
  try {
    await api.delete(`/api/tasks/${id}`);

    setTasks((prev) => prev.filter((task) => task._id !== id));

    // Remove the deleted task's reminder.
    const reminderId = `task-reminder-${id}`;

    let saved = [];

    try {
      saved = JSON.parse(
        localStorage.getItem("taskReminderNotifications") || "[]"
      );
    } catch {
      saved = [];
    }

    const updated = saved.filter(
      (item) => item.id !== reminderId
    );

    localStorage.setItem(
      "taskReminderNotifications",
      JSON.stringify(updated)
    );

    setTaskReminderNotifications(updated);

    // Prevent the scheduler from recreating this reminder.
    localStorage.setItem(`taskDeleted-${id}`, "true");

    window.dispatchEvent(new Event("taskReminderDeleted"));

  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

const toggleTask = async (task) => {
  const nextDone = !task.done;

  const today = new Date();
  const completionDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  try {
    const response = await api.put(`/api/tasks/${task._id}`, {
      done: nextDone,
      completionDate,
    });

    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? response.data : t
      )
    );

    // Allow the reminder to be created again when unchecked.
    localStorage.removeItem(`taskReminderSent-${task._id}`);

    if (nextDone) {
      // Remove the reminder when the task is completed.
      const reminderId = `task-reminder-${task._id}`;

      let saved = [];

      try {
        saved = JSON.parse(
          localStorage.getItem("taskReminderNotifications") || "[]"
        );
      } catch {
        saved = [];
      }

      const updated = saved.filter(
        (item) => item.id !== reminderId
      );

      localStorage.setItem(
        "taskReminderNotifications",
        JSON.stringify(updated)
      );

      setTaskReminderNotifications(updated);

      window.dispatchEvent(new Event("taskReminderDeleted"));
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

const changeTaskPriority = async (task, priority) => {
  try {
    const response = await api.put(`/api/tasks/${task._id}`, {
      priority: priority,
    });

    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? response.data : t
      )
    );
  } catch (error) {
    console.error(
      "Error updating task priority:",
      error.response?.data || error.message
    );
  }
};
  return (
  <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200">
  <style>{`
    .dark-mode .dashboard-search {
      background: rgba(51, 65, 85, 0.6) !important;
    }
    .dark-mode .dashboard-search input {
      background: transparent !important;
      color: #f3f4f6 !important;
      box-shadow: none !important;
      outline: none !important;
    }
    .dark-mode .dashboard-search input::placeholder {
      color: #94a3b8 !important;
    }
    .dark-mode .dashboard-search svg {
      color: #94a3b8 !important;
    }
      .notif-bell {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid transparent;
}
.notif-bell:hover {
  background: #f3e8ff;
  color: #9333ea;
}
.notif-bell:hover .bell-icon {
  animation: bell-ring 0.7s ease;
  transform-origin: top center;
}
.notif-badge {
  box-shadow: 0 0 0 2px #ffffff;
}

.dark-mode .notif-bell {
  background: rgba(168, 85, 247, 0.15) !important;
  color: #d8b4fe !important;
  border: 1px solid rgba(168, 85, 247, 0.35) !important;
}
.dark-mode .notif-bell:hover {
  background: rgba(168, 85, 247, 0.28) !important;
  color: #ffffff !important;
  box-shadow: 0 0 16px rgba(168, 85, 247, 0.4);
}
.dark-mode .notif-badge {
  box-shadow: 0 0 0 2px #1e293b; /* match your header color */
}

@keyframes bell-ring {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(14deg); }
  40% { transform: rotate(-12deg); }
  60% { transform: rotate(8deg); }
  80% { transform: rotate(-4deg); }
}
  `}</style>
      
    {/* Main */}
<div className="flex-1 flex flex-col overflow-hidden">
       {/* Top */}
<div className="relative z-50 shrink-0 px-6 py-4
                flex items-center justify-between gap-6
                bg-white 
                border-b border-gray-200/60 ">

  {/* Left: greeting */}
<div className="min-w-0">
  <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">
    {timeEmoji} {formattedToday}
  </p>

  <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-800 ">
    {headline},{" "}
    <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
      {user?.username || "there"}
    </span>
  </h2>

  <p className="mt-0.5 text-sm text-gray-500 ">
    {summary}
  </p>
</div>

  {/* Right: search + actions */}
  <div className="flex flex-1 items-center justify-end gap-3">

   {/* Search - desktop */}
<div className="dashboard-search hidden md:flex w-full max-w-md items-center rounded-xl px-4 py-2.5
                bg-gray-100/80
                border border-transparent transition
                focus-within:border-purple-400/60 focus-within:ring-4
                focus-within:ring-purple-500/10">
  <Search size={17} className="shrink-0 text-gray-400" />
  <input
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="ml-3 w-full bg-transparent text-sm outline-none
               text-gray-700 placeholder:text-gray-400"
    placeholder="Search tasks, notes, habits..."
  />
  {searchQuery && (
    <button
      onClick={() => setSearchQuery("")}
      className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                 bg-gray-300/60 text-[10px] text-gray-600 hover:bg-gray-300"
      title="Clear search"
    >
      ✕
    </button>
  )}
</div>

{/* Search - mobile icon button */}
<button
  type="button"
  onClick={() => setShowMobileSearch((prev) => !prev)}
  className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
             bg-gray-100/80 
             text-gray-600 
             transition hover:bg-purple-100 hover:text-purple-600"
  aria-label="Search"
  aria-expanded={showMobileSearch}
>
  <Search size={19} />
</button>

            <div className="relative">
            
  <button
  onClick={() => setShowNotifications((prev) => !prev)}
  className="notif-bell relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200"
  aria-label="Notifications"
  aria-expanded={showNotifications}
>
  <Bell size={19} className="bell-icon" />

  {unreadCount > 0 && (
    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px]">
      <span className="absolute inset-0 animate-ping rounded-full bg-pink-400 opacity-60" />
      <span className="notif-badge relative flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 px-1 text-[10px] font-bold text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    </span>
  )}
</button>
  {showNotifications && (
    <div className="absolute right-0 top-12 z-[100] w-80
                    max-h-96 overflow-y-auto bg-white rounded-2xl
                    shadow-xl border border-purple-100">

     <div className="flex items-center justify-between gap-2
                p-4 border-b border-gray-100">

  <div>
    <h3 className="font-bold text-gray-800">
      Notifications
    </h3>

    <p className="text-xs text-gray-400 mt-1">
      {unreadCount} unread
    </p>
  </div>

  <div className="flex items-center gap-3">
    {unreadCount > 0 && (
      <button
        onClick={markAllAsRead}
        className="text-xs font-semibold text-purple-600
                   hover:text-purple-800 whitespace-nowrap"
      >
        Mark all as read
      </button>
    )}

    <button
      onClick={() => setShowNotifications(false)}
      className="text-gray-400 hover:text-gray-700"
      aria-label="Close notifications"
    >
      ✕
    </button>
  </div>
</div>

      {notificationItems.length === 0 ? (
        <div className="p-8 text-center">
          <Bell size={28} className="mx-auto mb-2 text-purple-300" />
          <p className="font-medium text-gray-700">
            You're all caught up!
          </p>
          <p className="text-sm text-gray-400 mt-1">
            No upcoming events or reminders.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
         {notificationItems.map((item) => {
  const isRead = readNotifications.includes(item.id);

  return (
    <div
      key={item.id}
     onClick={() => handleNotificationClick(item)}
      className={`flex gap-3 p-4 cursor-pointer transition ${
        isRead
          ? "bg-white hover:bg-purple-50/60"
          : "bg-purple-50/50 hover:bg-purple-100/60"
      }`}
    >
              <div className={`w-10 h-10 shrink-0 rounded-xl
                flex items-center justify-center ${
              item.type === "event"
  ? "bg-pink-100 text-pink-600"
  : item.type === "habit"
  ? "bg-green-100 text-green-600"
  : "bg-purple-100 text-purple-600"
                }`}>
                {item.type === "event" ? (
  <Calendar size={18} />
) : item.type === "habit" ? (
  <Heart size={18} />
) : (
  <CheckSquare size={18} />
)}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800
                              break-words">
                  {item.title}
                </p>
               <p className="text-xs text-gray-500 mt-1">
  {item.message}
</p>

{isRead ? (
  <p className="text-xs text-gray-400 mt-1">
    Read
  </p>
) : (
  <p className="text-xs text-purple-600 font-medium mt-1">
    New
  </p>
)}
              </div>
              </div>
  );
})}
</div>
      )}
    </div>
  )}
</div>
           
<div className="relative">
 <button
  type="button"
  onClick={() => setShowProfileMenu((prev) => !prev)}
  className="flex h-10 w-10 items-center justify-center rounded-xl
             bg-gradient-to-br from-purple-500 to-pink-500
             shadow-lg shadow-purple-500/30 transition
             hover:scale-105 hover:shadow-purple-500/50"
  aria-label="Open Daily Focus"
  aria-expanded={showProfileMenu}
  title="Daily Focus"
>
  <span className="text-lg">🎯</span>
</button>

  {showProfileMenu && (
  <div className="absolute right-0 top-12 z-[100] w-72
                bg-white rounded-2xl shadow-xl
                border border-purple-100 overflow-hidden">

      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
     <h3 className="font-bold text-gray-800">
  🎯 Daily Focus
</h3>
        <p className="text-sm text-gray-500 mt-1">
          Small steps make progress!
        </p>
      </div>

     <div className="p-4 dark:bg-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Your unfinished tasks
        </p>

        {tasks.filter((task) => !task.done).length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tasks
              .filter((task) => !task.done)
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task._id || task.id || task.text}
                  className="flex items-start gap-2 p-2 rounded-xl bg-purple-50 dark:bg-gray-700 border border-purple-100 dark:border-gray-600"
                >
                  <span className="text-purple-500">○</span>
                  <span className="text-sm text-gray-800 dark:text-gray-100 break-words">
                    {task.text}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-xl">
            ✨ All tasks completed! Great job!
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowProfileMenu(false)}
          className="mt-4 w-full py-2 rounded-xl text-sm font-medium
                     text-purple-600 bg-purple-50 hover:bg-purple-100 transition"
        >
          Close
        </button>
      </div>
    </div>
    )}
</div>

          </div>

          {/* Mobile search bar */}
          {showMobileSearch && (
            <div className="md:hidden absolute left-0 right-0 top-full z-40
                            px-4 py-3 bg-white 
                            border-b border-gray-200/60 shadow-lg">
             <div className="dashboard-search flex items-center rounded-xl px-4 py-2.5
                bg-gray-100 ">
                <Search size={17} className="shrink-0 text-gray-400" />
                <input
                  ref={mobileSearchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-3 w-full bg-transparent text-base outline-none
                             text-gray-700 dark:text-gray-100 placeholder:text-gray-400"
                  placeholder="Search tasks, notes, habits..."
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowMobileSearch(false);
                  }}
                  className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                             bg-gray-300/60 text-xs text-gray-600"
                  aria-label="Close search"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

        </div>
  <div className="flex-1 overflow-y-auto p-6">
       {/* TOP CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:max-w-5xl gap-3 mb-6">
  <Card
    title="Today's Progress"
    value={`${todaysProgress}%`}
    color="purple"
    icon={TrendingUp}
    progress={todaysProgress}
  />
  <Card
    title="Tasks Completed"
    value={`${completedTasks}/${totalTasks}`}
    color="blue"
    icon={CheckSquare}
    progress={totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100}
  />
  <Card
    title="Habits Tracked"
    value={`${completedHabitsToday}/${totalHabits}`}
    color="pink"
    icon={Heart}
    progress={totalHabits === 0 ? 0 : (completedHabitsToday / totalHabits) * 100}
  />
  <Card
    title="Day Streak"
    value={overallStreak}
    suffix={overallStreak === 1 ? "day" : "days"}
    color="orange"
    icon={Flame}
  />
</div>

        {/* TASKS + EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
       <div id="tasks-section" className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
  <div>
    <h3 className="font-bold text-lg">Today's Tasks</h3>
    <p className="text-sm text-gray-400 mt-1">
      {tasks.filter((task) => task.done).length} of {tasks.length} completed
    </p>
  </div>

  <div className="text-sm font-semibold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">
    {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
  </div>
</div>
<div className="mb-5">

  <div className="flex justify-between text-xs text-gray-400 mb-2">
    <span>Daily progress</span>

    <span>
      {tasks.length === 0
        ? 0
        : Math.round(
            (tasks.filter((task) => task.done).length /
              tasks.length) *
              100
          )}
      %
    </span>
  </div>

  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

    <div
      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
      style={{
        width: `${
          tasks.length === 0
            ? 0
            : (tasks.filter((task) => task.done).length /
                tasks.length) *
              100
        }%`,
      }}
    />

  </div>

</div>
   <div className="flex flex-col gap-3 mb-4">

  <div className="flex gap-2">
    <input
      value={newTask}
      onChange={(e) => setNewTask(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          addTask();
        }
      }}
      className="flex-1 border border-gray-200 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-purple-200"
      placeholder="Add a new task..."
    />

    <button
      onClick={addTask}
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-11 h-11 rounded-full flex items-center justify-center hover:scale-105 transition"
    >
      <Plus size={20} />
    </button>
  </div>

  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-400">
      Priority:
    </span>

    {[
      { name: "low", label: "Low", color: "bg-green-100 text-green-600" },
      { name: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-600" },
      { name: "high", label: "High", color: "bg-red-100 text-red-600" },
    ].map((priority) => (
      <button
        key={priority.name}
        onClick={() => setTaskPriority(priority.name)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
          taskPriority === priority.name
            ? `${priority.color} ring-2 ring-purple-300`
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {priority.label}
      </button>
    ))}
  </div>

</div>

            <div className="flex flex-col gap-3">
        {[...filteredTasks]
  .sort((a, b) => {
    const priorityOrder = {
      high: 1,
      medium: 2,
      low: 3,
    };

    return (
      (priorityOrder[a.priority] || 2) -
      (priorityOrder[b.priority] || 2)
    );
  })
  .map((task) => (
    <Task
      key={task._id}
      task={task}
      onDelete={deleteTask}
      onToggle={toggleTask}
      onPriorityChange={changeTaskPriority}
    />
  ))}
            </div>
          </div>

       
<div className="bg-white p-6 rounded-2xl shadow">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-lg">Upcoming Events</h3>
    <Calendar size={18} className="text-purple-500" />
  </div>

  {upcomingEvents.length === 0 ? (
    <div className="py-8 text-center">
      <Calendar size={30} className="mx-auto mb-2 text-purple-300" />
      <p className="text-sm font-medium text-gray-600">
        No upcoming events
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Your schedule is clear ✨
      </p>
    </div>
  ) : (
    <div className="space-y-3">
      {filteredUpcomingEvents.map((event) => (
        <div
          key={event._id}
          className="flex items-start gap-3 rounded-xl border border-purple-50 bg-purple-50/60 p-3"
        >
          <div className="mt-1 h-9 w-1 shrink-0 rounded-full bg-purple-400" />

          <div className="min-w-0 flex-1">
            <p className="break-words font-semibold text-gray-800">
              {event.title}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {new Date(event.date).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        </div>

        {/* NEW SECTION (SCROLL PART) */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
{/* Calendar */}
<div id="calendar-section" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

  {/* Calendar Header */}
  <div className="flex items-center justify-between mb-6">

    <div>
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-pink-500" />

        <h3 className="font-bold text-lg">
          Calendar
        </h3>
      </div>

      <p className="text-sm text-gray-400 mt-1">
        Plan your days and upcoming events
      </p>
    </div>

    {/* Month navigation */}
    <div className="flex items-center gap-2">

      <button
        onClick={() => {
          setCurrentMonth(
            new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth() - 1,
              1
            )
          );
        }}
        className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-500 transition flex items-center justify-center"
      >
        ←
      </button>

      <button
        onClick={() => {
          setCurrentMonth(
            new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth() + 1,
              1
            )
          );
        }}
        className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-500 transition flex items-center justify-center"
      >
        →
      </button>

    </div>
  </div>


  {/* Month title */}
  <div className="flex items-center justify-between mb-5">

    <h2 className="text-2xl font-bold text-gray-800">
      {currentMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric"
      })}
    </h2>

    <button
      onClick={() => setCurrentMonth(new Date())}
      className="text-xs font-semibold text-purple-500 bg-purple-50 px-3 py-2 rounded-full hover:bg-purple-100 transition"
    >
      Today
    </button>

  </div>


  {/* Week days */}
  <div className="grid grid-cols-7 mb-2">

    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
      <div
        key={day}
        className="text-center text-xs font-semibold text-gray-400 py-2"
      >
        {day}
      </div>
    ))}

  </div>


  {/* Calendar days */}
  <div className="grid grid-cols-7 gap-2">

    {(() => {

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(
        year,
        month + 1,
        0
      ).getDate();

      const days = [];

      // Empty spaces before first day
      for (let i = 0; i < firstDay; i++) {
        days.push(
          <div key={`empty-${i}`} />
        );
      }


      // Days
      for (let day = 1; day <= daysInMonth; day++) {

        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const today = new Date();

        const isToday =
          today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === day;

        const isSelected =
          selectedDate === dateKey;

        const dayEvents = events.filter((event) => {
  const eventDate = event.date.split("T")[0];

  return eventDate === dateKey;
});


        days.push(

          <button
            key={day}
            onClick={() => {

              setSelectedDate(dateKey);

              setSelectedDayEvents(dayEvents);

            }}
            className={`relative min-h-[58px] rounded-2xl flex flex-col items-center justify-start pt-2 transition-all

              ${
                isSelected
                  ? "bg-purple-100 ring-2 ring-purple-300"
                  : isToday
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "hover:bg-purple-50"
              }
            `}
          >

            <span
              className={`text-sm font-semibold ${
                isToday && !isSelected
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {day}
            </span>


            {/* Event indicators */}

            {dayEvents.length > 0 && (

              <div className="flex gap-1 mt-2">

                {dayEvents.slice(0, 3).map((event) => (

                  <span
                    key={event._id}
                    className="w-1.5 h-1.5 rounded-full bg-pink-400"
                  />

                ))}

              </div>

            )}

          </button>

        );
      }

      return days;

    })()}

  </div>


  {/* Selected day panel */}

  {selectedDate && (

    <div className="mt-6 border-t border-gray-100 pt-5">

      {/* Selected date header */}

      <div className="flex items-center justify-between mb-4">

        <div>

          <h4 className="font-bold text-gray-800">
            {new Date(
              selectedDate + "T00:00:00"
            ).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </h4>

          <p className="text-xs text-gray-400 mt-1">
            {selectedDayEvents.length === 0
              ? "No events yet"
              : `${selectedDayEvents.length} ${
                  selectedDayEvents.length === 1
                    ? "event"
                    : "events"
                }`}
          </p>

        </div>

        <button
          onClick={() => {
            setSelectedDate(null);
            setSelectedDayEvents([]);
          }}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
        >
          ✕
        </button>

      </div>


      {/* Existing events */}

      {selectedDayEvents.length > 0 && (

        <div className="space-y-2 mb-5">

          {selectedDayEvents.map((event) => (

            <div
              key={event._id}
              className="group bg-gray-50 hover:bg-purple-50 border border-gray-100 rounded-2xl p-4 transition"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex items-start gap-3">

                  <div className="w-2 h-10 rounded-full bg-gradient-to-b from-purple-400 to-pink-400" />

                  <div>

                    <p className="font-semibold text-gray-800">
                      {event.title}
                    </p>

                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {event.description}
                      </p>
                    )}

                  </div>

                </div>


                <button
                  onClick={() => deleteEvent(event._id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                  title="Delete event"
                >
                  🗑️
                </button>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* Add event */}

      <div className="bg-purple-50 rounded-2xl p-4">

        <h4 className="font-semibold text-gray-700 mb-3">
          Add an event
        </h4>

        <input
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Event title..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200 mb-2"
        />

        <textarea
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          placeholder="Description (optional)..."
          rows="2"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200 mb-3"
        />

        <button
          onClick={addEvent}
          disabled={!eventTitle.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition hover:scale-[1.01]"
        >
          + Add Event
        </button>

      </div>

    </div>

  )}

</div>

        {/* Habits */}
<div
  id="habits-section"
  className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4"
>

  <h3 className="flex items-center gap-2 font-bold text-lg">
    <Heart className="text-pink-500" size={18} />
    Daily Habits
  </h3>

  {/* Add habit */}
  <div className="bg-purple-50 rounded-2xl p-4">

    <input
      value={newHabit}
      onChange={(e) => setNewHabit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          addHabit();
        }
      }}
      placeholder="Add a new habit..."
      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200"
    />

    {/* Colors */}
    <div className="flex items-center gap-2 mt-3">

      {["purple", "pink", "blue", "green", "orange"].map(
        (color) => (
          <button
            key={color}
            onClick={() => setHabitColor(color)}
            className={`w-6 h-6 rounded-full transition ${
              color === "purple"
                ? "bg-purple-400"
                : color === "pink"
                ? "bg-pink-400"
                : color === "blue"
                ? "bg-blue-400"
                : color === "green"
                ? "bg-green-400"
                : "bg-orange-400"
            } ${
              habitColor === color
                ? "ring-2 ring-offset-2 ring-gray-400"
                : ""
            }`}
          />
        )
      )}

      <button
        onClick={addHabit}
        disabled={!newHabit.trim()}
        className="ml-auto bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
      >
        + Add
      </button>

    </div>
  </div>

  {/* Habits list */}
  <div className="space-y-2">

    {habits.length === 0 ? (
      <div className="text-center py-6 text-gray-400 text-sm">
        No habits yet 🌱
      </div>
    ) : (
      filteredHabits.map((habit) => {

        const today = new Date()
          .toISOString()
          .split("T")[0];

        const completedToday =
          habit.completedDates?.includes(today);

        return (
      <div
  key={habit._id}
  className={`group flex items-center justify-between p-3 rounded-xl border transition ${
    completedToday
      ? "bg-green-50 border-green-100"
      : habit.color === "purple"
      ? "bg-purple-50 border-purple-100 hover:bg-purple-100"
      : habit.color === "pink"
      ? "bg-pink-50 border-pink-100 hover:bg-pink-100"
      : habit.color === "blue"
      ? "bg-blue-50 border-blue-100 hover:bg-blue-100"
      : habit.color === "green"
      ? "bg-green-50 border-green-100 hover:bg-green-100"
      : "bg-orange-50 border-orange-100 hover:bg-orange-100"
  }`}
>

            <div className="flex items-center gap-3">
<span
  className={`w-2.5 h-2.5 rounded-full ${
    habit.color === "purple"
      ? "bg-purple-400"
      : habit.color === "pink"
      ? "bg-pink-400"
      : habit.color === "blue"
      ? "bg-blue-400"
      : habit.color === "green"
      ? "bg-green-400"
      : "bg-orange-400"
  }`}
/>
              <button
                onClick={() => toggleHabit(habit._id)}
             className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
  completedToday
    ? habit.color === "purple"
      ? "bg-purple-500 text-white"
      : habit.color === "pink"
      ? "bg-pink-500 text-white"
      : habit.color === "blue"
      ? "bg-blue-500 text-white"
      : habit.color === "green"
      ? "bg-green-500 text-white"
      : "bg-orange-500 text-white"
    : "bg-white border-2 border-gray-200 text-gray-300 hover:border-purple-400"
}`}
              >
                {completedToday ? "✓" : "○"}
              </button>

              <div>
               <p
  style={{ color: "#000000" }}
  className={`font-semibold text-sm ${
    completedToday ? "line-through" : ""
  }`}
>
  {habit.name}
</p>
               <div className="flex items-center gap-2 mt-1">

  <p style={{ color: "#000000" }} className="text-xs">
    {completedToday
      ? "Completed today 🎉"
      : "Not completed yet"}
  </p>

  {getHabitStreak(habit.completedDates) > 0 && (
    <span className="text-xs font-semibold text-orange-500">
      🔥 {getHabitStreak(habit.completedDates)}
    </span>
  )}

</div>
              </div>

            </div>

            <button
              onClick={() => deleteHabit(habit._id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
              title="Delete habit"
            >
              🗑️
            </button>

          </div>
        );
      })
    )}

  </div>

</div>

  {/* Notes */}
<div className="bg-white p-6 rounded-2xl shadow">

  {/* Notes Header */}
 <div className="mb-4">

  <div className="flex items-center justify-between mb-3">

    <h3 className="flex items-center gap-2 font-bold text-lg">
      <FileText size={18} className="text-orange-500" />
      Notes
    </h3>

    <button
      onClick={() => {
        setNoteTitle("");
        setNoteContent("");
        setShowNoteEditor(true);
      }}
      className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-full text-sm"
    >
      <Plus size={16} />
      New
    </button>

  </div>

  <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">

    <Search size={16} className="text-gray-400" />

    <input
      value={noteSearch}
      onChange={(e) => setNoteSearch(e.target.value)}
      placeholder="Search notes..."
      className="ml-2 bg-transparent outline-none w-full text-sm"
    />

  </div>

</div>

  {/* New Note Editor */}
  {showNoteEditor && (
    <div
  className={`mb-4 rounded-2xl p-4 border transition-all duration-300 ${
    {
      purple: "bg-purple-50 border-purple-100",
      pink: "bg-pink-50 border-pink-100",
      blue: "bg-blue-50 border-blue-100",
      yellow: "bg-yellow-50 border-yellow-100",
      green: "bg-green-50 border-green-100",
      orange: "bg-orange-50 border-orange-100",
    }[noteColor] || "bg-purple-50 border-purple-100"
  }`}
>

      <input
        type="text"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Note title..."
        className="w-full bg-white/80 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-purple-300 mb-3"
      />

      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Write your note..."
        className="w-full bg-white/80 rounded-xl px-4 py-3 h-32 text-gray-700 outline-none focus:ring-2 focus:ring-purple-300 resize-none"
      />
{/* NOTE COLOR */}
<div className="mt-4">
  <p className="text-sm font-semibold text-gray-700 mb-2">
    Note color
  </p>

  <div className="flex items-center gap-3">
    {[
      { name: "purple", className: "bg-purple-200", label: "Lavender" },
      { name: "pink", className: "bg-pink-200", label: "Rose" },
      { name: "blue", className: "bg-blue-200", label: "Sky" },
      { name: "yellow", className: "bg-yellow-200", label: "Sun" },
      { name: "green", className: "bg-green-200", label: "Mint" },
      { name: "orange", className: "bg-orange-200", label: "Peach" },
    ].map((color) => (
      <button
        key={color.name}
        type="button"
        title={color.label}
        onClick={() => setNoteColor(color.name)}
        className={`w-9 h-9 rounded-full ${color.className} transition-all duration-200 ${
          noteColor === color.name
            ? "ring-2 ring-purple-500 ring-offset-2 scale-110"
            : "hover:scale-110"
        }`}
      />
    ))}
  </div>
</div>
      <div className="flex justify-end gap-2 mt-3">

        <button
          onClick={() => {
            setShowNoteEditor(false);
            setNoteTitle("");
            setNoteContent("");
          }}
          className="px-4 py-2 rounded-xl bg-white text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            if (!noteTitle.trim() && !noteContent.trim()) return;

            await addNote(
              noteTitle.trim() || "Untitled Note",
              noteContent.trim() || " ",
              noteColor
            );

            setNoteTitle("");
            setNoteContent("");
            setNoteColor("purple");
            setShowNoteEditor(false);
          }}
          className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600"
        >
          💾 Save Note
        </button>

      </div>
    </div>
  )}

  {/* Existing Notes */}
  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">

    {notes.length === 0 ? (
      <div className="text-center text-gray-400 py-8">
        <FileText size={32} className="mx-auto mb-2 opacity-50" />
        <p>No notes yet</p>
        <p className="text-sm">Create your first note!</p>
      </div>
    ) : (
     
notes
  .filter((note) => {
    const title = (note.title || "").toLowerCase();
    const content = (note.content || "").toLowerCase();
    const localQuery = noteSearch.trim().toLowerCase();

    const matchesGlobal =
      !globalQuery ||
      title.includes(globalQuery) ||
      content.includes(globalQuery);

    const matchesNotesSearch =
      !localQuery ||
      title.includes(localQuery) ||
      content.includes(localQuery);

    return matchesGlobal && matchesNotesSearch;
  })
  .map((note) => (

    <NoteCard
      key={note._id}
      note={note}
      onUpdate={updateNote}
      onDelete={deleteNote}
    />
  ))
    )}

  </div>

</div>
        </div>
       <ExtraSections tasks={tasks} habits={habits} />
      </div>
    </div>
     </div> 
  );
}

function Card({ title, value, color, icon: Icon, progress, suffix }) {
  const styles = {
    purple: {
      text: "text-purple-600",
      badge: "from-purple-500 to-fuchsia-500 shadow-purple-500/30",
      bar: "from-purple-500 to-fuchsia-500",
      hover: "hover:border-purple-400/50 hover:shadow-purple-500/20",
    },
    blue: {
      text: "text-blue-600",
      badge: "from-blue-500 to-indigo-500 shadow-blue-500/30",
      bar: "from-blue-500 to-indigo-500",
      hover: "hover:border-blue-400/50 hover:shadow-blue-500/20",
    },
    pink: {
      text: "text-pink-600",
      badge: "from-pink-500 to-rose-500 shadow-pink-500/30",
      bar: "from-pink-500 to-rose-500",
      hover: "hover:border-pink-400/50 hover:shadow-pink-500/20",
    },
    orange: {
      text: "text-orange-500",
      badge: "from-orange-400 to-amber-500 shadow-orange-500/30",
      bar: "from-orange-400 to-amber-500",
      hover: "hover:border-orange-400/50 hover:shadow-orange-500/20",
    },
  };

  const s = styles[color] || styles.purple;
  const safeProgress = Math.max(0, Math.min(100, progress || 0));

  return (
    <div
      className={`group relative overflow-hidden bg-white rounded-2xl border border-gray-200/60
                  px-4 py-3 shadow-sm transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-lg ${s.hover}`}
    >
      {/* soft glow in the corner */}
      <div
        className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full
                    bg-gradient-to-br ${s.badge} opacity-10 blur-2xl
                    transition-opacity duration-300 group-hover:opacity-25`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </p>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <h3 className={`text-2xl font-bold leading-none ${s.text}`}>
              {value}
            </h3>
            {suffix && (
              <span className="text-sm font-medium text-gray-400">{suffix}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                        bg-gradient-to-br ${s.badge} text-white shadow-lg
                        transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* thin progress bar (not shown on the streak card) */}
      {progress !== undefined && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200/60">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-700`}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Task({ task, onDelete, onToggle, onPriorityChange }) {
  const priorityStyles = {
    low: "bg-green-100 text-green-600",
    medium: "bg-yellow-100 text-yellow-600",
    high: "bg-red-100 text-red-600",
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const priority = task.priority || "medium";

  return (
    <div
      className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
        task.done
          ? "bg-purple-50 border-purple-100"
          : "bg-white border-gray-100 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >

      {/* CHECK BUTTON */}
      <button
        onClick={() => onToggle(task)}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
          task.done
            ? "bg-purple-500 border-purple-500 text-white"
            : "border-gray-300 hover:border-purple-400"
        }`}
      >
        {task.done && "✓"}
      </button>

      {/* TASK CONTENT */}
      <div className="flex-1 min-w-0">

        <p
          className={`font-medium break-words ${
            task.done
              ? "line-through text-gray-400"
              : "text-gray-700"
          }`}
        >
          {task.text}
        </p>

    <button
  onClick={() => {
    const nextPriority = {
      low: "medium",
      medium: "high",
      high: "low",
    }[priority];

    onPriorityChange(task, nextPriority);
  }}
  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer hover:scale-105 transition ${
    priorityStyles[priority]
  }`}
  title="Click to change priority"
>
  {priorityLabels[priority]}
</button>

      </div>

      {/* DELETE */}
      <button
        onClick={() => onDelete(task._id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition text-sm"
        title="Delete task"
      >
        🗑️
      </button>

    </div>
  );
}
function NoteCard({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [editColor, setEditColor] = useState(note.color || "purple");
const colorClasses = {
  purple: "bg-purple-50 border-purple-100",
  pink: "bg-pink-50 border-pink-100",
  blue: "bg-blue-50 border-blue-100",
  yellow: "bg-yellow-50 border-yellow-100",
  green: "bg-green-50 border-green-100",
  orange: "bg-orange-50 border-orange-100",
};

const noteColor =
  colorClasses[note.color] || colorClasses.purple;
  const handleSave = async () => {
    await onUpdate(note._id, title, content, editColor);
    setEditing(false);
  };

  return (
  <div
  className={`${
    colorClasses[editing ? editColor : note.color] || colorClasses.purple
  } border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300`}
>

      {editing ? (
        <>
          {/* EDIT TITLE */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 mb-3 font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Note title"
          />

          {/* EDIT CONTENT */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 h-28 outline-none resize-none focus:ring-2 focus:ring-purple-300"
            placeholder="Write your note..."
          />
<div className="mt-4">
  <p className="text-sm font-semibold text-gray-700 mb-2">
    Note color
  </p>

  <div className="flex gap-2">
    {[
      { name: "purple", className: "bg-purple-200" },
      { name: "pink", className: "bg-pink-200" },
      { name: "blue", className: "bg-blue-200" },
      { name: "yellow", className: "bg-yellow-200" },
      { name: "green", className: "bg-green-200" },
      { name: "orange", className: "bg-orange-200" },
    ].map((color) => (
      <button
        key={color.name}
        type="button"
        onClick={() => setEditColor(color.name)}
        className={`w-9 h-9 rounded-full ${color.className} transition-all duration-200 ${
          editColor === color.name
            ? "ring-2 ring-purple-500 ring-offset-2 scale-110"
            : "hover:scale-110"
        }`}
      />
    ))}
  </div>
</div>
          {/* EDIT BUTTONS */}
          <div className="flex justify-end gap-2 mt-3">

            <button
              onClick={() => setEditing(false)}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm hover:opacity-90"
            >
              💾 Save Changes
            </button>

          </div>
        </>
      ) : (
        <>
          {/* NOTE HEADER */}
          <div className="flex items-start justify-between gap-3">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
  📝
</div>

              <div>
                <h4 className="font-bold text-gray-800">
                  {note.title}
                </h4>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(note.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

            </div>

          </div>

          {/* NOTE CONTENT */}
          <div className="mt-3 bg-white/70 rounded-xl p-3">
       <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-4 dashboard-note-text">
  {note.content || "Empty note"}
</p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 mt-3">

            <button
              onClick={() => {
  setEditColor(note.color || "purple");
  setEditing(true);
}}
              className="px-3 py-2 rounded-xl bg-white border border-purple-100 text-purple-600 hover:bg-purple-50 text-sm"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => onDelete(note._id)}
              className="px-3 py-2 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 text-sm"
            >
              🗑️ Delete
            </button>

          </div>
        </>
      )}

    </div>
  );
}
function Event({ title, time }) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl mb-3">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  );
}

function Habit({ icon, text, active }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${active ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{text}</span>
      </div>
      {active && <span>✔</span>}
    </div>
    
  );
}

/* ===== EXTRA SECTION (BOTTOM) ===== */

// Add inside main scroll container (already included layout supports scroll)



export function ExtraSections({ tasks = [], habits = [] }) {
  const now = new Date();

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Find Monday of the current week
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const dayOfWeek = monday.getDay();
  monday.setDate(monday.getDate() - ((dayOfWeek + 6) % 7));

  // Calculate completed activities for each day
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const key = getDateKey(date);

 
const completedTasks = tasks.filter((task) => {
  const completedOnThisDay = (task.completionHistory || []).some(
    (date) => {
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date === key;
      }

      const completedDate = new Date(date);

      return (
        !Number.isNaN(completedDate.getTime()) &&
        getDateKey(completedDate) === key
      );
    }
  );

  const legacyCompletion =
    task.completedAt &&
    getDateKey(new Date(task.completedAt)) === key;

  // For today, count only tasks that are currently checked.
  if (key === getDateKey(now)) {
    return task.done && (completedOnThisDay || legacyCompletion);
  }

  // For previous days, preserve their saved completion history.
  return completedOnThisDay || (task.done && legacyCompletion);
}).length;
    const completedHabits = habits.filter((habit) =>
      habit.completedDates?.includes(key)
    ).length;

    return {
      key,
      date,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      completed: completedTasks + completedHabits,
      isToday: key === getDateKey(now),
    };
  });

  const todayKey = getDateKey(now);

  const todayActivity =
    weekDays.find((day) => day.key === todayKey)?.completed ?? 0;

  const DAILY_TARGET = 10;

  return (
    <>
      {/* Weekly Activity Chart */}
      <div className="bg-white p-6 rounded-2xl shadow mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Weekly Activity
            </h2>
            <p className="text-sm text-gray-500">
              Your completed tasks and habits
            </p>
          </div>

          <div className="rounded-xl bg-purple-100 px-3 py-2">
            <span className="text-sm font-semibold text-purple-700">
              This Week
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const progress = Math.min(
              100,
              Math.round((day.completed / DAILY_TARGET) * 100)
            );

            return (
              <div
                key={day.key}
                className="flex flex-col items-center min-w-0"
              >
                <span className="text-xs font-semibold text-gray-600 mb-2">
                  {day.completed}
                </span>

                {/* Fixed-height area makes 100% fill the entire bar space */}
                <div className="w-full h-32 flex items-end justify-center">
                  <div
                    title={`${day.key}: ${day.completed} activities (${progress}%)`}
                    className={`w-full max-w-10 rounded-t-xl transition-all duration-700 ease-out ${
                      day.isToday
                        ? "bg-gradient-to-t from-purple-600 to-pink-400"
                        : "bg-purple-200"
                    }`}
                    style={{
                      height: `${progress}%`,
                      minHeight: day.completed > 0 ? "6px" : "0px",
                    }}
                  />
                </div>

                <span
                  className={`text-xs mt-3 ${
                    day.isToday
                      ? "font-bold text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  {day.label}
                </span>

                <span
                  className={`text-[10px] mt-1 ${
                    day.isToday
                      ? "text-purple-500 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {day.date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl bg-purple-50 p-4">
          <p className="text-sm text-purple-700">
            <span className="font-bold">Today's activity:</span>{" "}
            {todayActivity} completed{" "}
            {todayActivity === 1 ? "item" : "items"} 🎯
          </p>
        </div>
      </div>
    </>
  );
}



