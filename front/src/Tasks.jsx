import React, { useEffect, useMemo, useRef , useState } from "react";
import { NavLink } from "react-router-dom";
import api from "./api";
import Sidebar from "./Sidebar";
import {
  Home,
  CheckSquare,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  Plus,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  ListTodo,
  CircleCheck,
  Clock3,
  Sparkles,
} from "lucide-react";

const priorityStyles = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function Tasks() {
   
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");


useEffect(() => {
  if (loading) return;

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

    const reminderKey = `taskReminderSent-${task._id}`;

    if (localStorage.getItem(reminderKey) === "true") return;

    const createdTime = new Date(task.createdAt).getTime();

    if (Number.isNaN(createdTime)) return;

    // Two hours after task creation.
    const reminderTime = createdTime + 2 * 60* 60 * 1000;
    const remainingTime = reminderTime - Date.now();

    if (remainingTime > 0) return;

    // Prevent duplicate reminders.
    localStorage.setItem(reminderKey, "true");

    const notification = {
      id: `task-reminder-${task._id}`,
      type: "task",
      title: task.text,
      message: "This task is still unfinished. Don't forget to complete it!",
      createdAt: new Date().toISOString(),
    };

    // Save the reminder for the Dashboard bell.
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

    // Notify the Dashboard immediately.
    window.dispatchEvent(
      new CustomEvent("taskReminderCreated", {
        detail: notification,
      })
    );

    // Send the PC/browser notification if permission is granted.
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

  window.addEventListener("notificationSettingsChanged", checkAllTasks);
  window.addEventListener("focus", checkAllTasks);

  return () => {
    timers.forEach(clearTimeout);

    window.removeEventListener("notificationSettingsChanged", checkAllTasks);
    window.removeEventListener("focus", checkAllTasks);
  };
}, [tasks, loading]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/tasks");
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load your tasks. Please try again."
      );
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (event) => {
    event.preventDefault();
    if (!newTask.trim()) return;

    try {
      setError("");
      const response = await api.post("/api/tasks", {
        text: newTask.trim(),
        priority: newPriority,
      });

      setTasks((previous) => [response.data, ...previous]);
      setNewTask("");
      setNewPriority("medium");
      setFilter("all");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't add the task. Please try again."
      );
      console.error("Error adding task:", err);
    }
  };

  const toggleTask = async (task) => {
    try {
      setError("");
      const response = await api.put(`/api/tasks/${task._id}`, {
        done: !task.done,
      });

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id ? response.data : item
        )
      );
    } catch (err) {
      setError("Couldn't update this task. Please try again.");
      console.error("Error updating task:", err);
    }
  };

const deleteTask = async (id) => {
  if (!window.confirm("Delete this task?")) return;

  try {
    setError("");

    await api.delete(`/api/tasks/${id}`);

    setTasks((previous) =>
      previous.filter((task) => task._id !== id)
    );

    const reminderId = `task-reminder-${id}`;

    const saved = JSON.parse(
      localStorage.getItem("taskReminderNotifications") || "[]"
    );

    localStorage.setItem(
      "taskReminderNotifications",
      JSON.stringify(
        saved.filter((item) => item.id !== reminderId)
      )
    );

    localStorage.setItem(`taskDeleted-${id}`, "true");

    window.dispatchEvent(new Event("taskReminderDeleted"));

  } catch (err) {
    setError("Couldn't delete this task. Please try again.");
    console.error("Error deleting task:", err);
  }
};
  const saveEdit = async (task) => {
    if (!editText.trim()) return;

    try {
      setError("");
      const response = await api.put(`/api/tasks/${task._id}`, {
        text: editText.trim(),
      });

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id ? response.data : item
        )
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      setError(
        "Couldn't save the edit. Check that your task API allows text updates."
      );
      console.error("Error editing task:", err);
    }
  };

  const changePriority = async (task, priority) => {
    try {
      setError("");
      const response = await api.put(`/api/tasks/${task._id}`, { priority });

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id ? response.data : item
        )
      );
    } catch (err) {
      setError("Couldn't update the priority. Please try again.");
      console.error("Error changing priority:", err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = (task.text || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.done) ||
        (filter === "completed" && task.done);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const completedCount = tasks.filter((task) => task.done).length;
  const activeCount = tasks.length - completedCount;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
<div className="min-h-full bg-[#f8f7fc] text-slate-800">
      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-500">
              Your personal workspace
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              My Tasks <span>✨</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Small steps add up. Let's get things done.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <CircleCheck size={19} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Your progress</p>
              <p className="font-bold">{progress}% completed</p>
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}

        <section className="mb-7 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ListTodo size={20} />}
            label="All tasks"
            value={tasks.length}
            color="violet"
          />
          <StatCard
            icon={<Clock3 size={20} />}
            label="Still to do"
            value={activeCount}
            color="amber"
          />
          <StatCard
            icon={<CircleCheck size={20} />}
            label="Completed"
            value={completedCount}
            color="emerald"
          />
        </section>

        <section className="mb-6 rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Add a new task</h2>
            <p className="mt-1 text-sm text-slate-400">
              Write it down so you can focus on getting it done.
            </p>
          </div>

          <form onSubmit={addTask} className="flex flex-col gap-3 lg:flex-row">
            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="What do you need to do?"
              maxLength={200}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50"
            />

            <select
              value={newPriority}
              onChange={(event) => setNewPriority(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-300"
              aria-label="Task priority"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>

            <button
              type="submit"
              disabled={!newTask.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-400 px-5 py-3 font-semibold text-white shadow-md shadow-violet-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              Add task
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">Your task list</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Organize your day, one task at a time.
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All tasks"],
                ["active", "To do"],
                ["completed", "Completed"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === value
                      ? "bg-violet-600 text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {label}
                  {value === "all"
                    ? ` (${tasks.length})`
                    : value === "active"
                    ? ` (${activeCount})`
                    : ` (${completedCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="py-14 text-center text-sm text-slate-400">
                Loading your tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-500">
                  <CheckSquare size={25} />
                </div>
                <h3 className="font-bold">
                  {search
                    ? "No matching tasks"
                    : filter === "completed"
                    ? "Nothing completed yet"
                    : filter === "active"
                    ? "You're all caught up!"
                    : "Your list is ready"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {search
                    ? "Try another search."
                    : "Add a task above to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`group flex items-start gap-3 rounded-2xl border p-4 transition hover:shadow-sm sm:items-center ${
                      task.done
                        ? "border-violet-100 bg-violet-50/60"
                        : "border-slate-100 bg-white hover:border-violet-100"
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task)}
                      aria-label={
                        task.done ? "Mark task as not done" : "Complete task"
                      }
                      className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition sm:mt-0 ${
                        task.done
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-slate-300 text-transparent hover:border-violet-400"
                      }`}
                    >
                      <Check size={14} />
                    </button>

                    <div className="min-w-0 flex-1">
                      {editingId === task._id ? (
                        <form
                          className="flex flex-col gap-2 sm:flex-row"
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveEdit(task);
                          }}
                        >
                          <input
                            autoFocus
                            value={editText}
                            onChange={(event) => setEditText(event.target.value)}
                            maxLength={200}
                            className="min-w-0 flex-1 rounded-lg border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-violet-50"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="rounded-lg bg-violet-600 p-2 text-white hover:bg-violet-700"
                              aria-label="Save task"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditText("");
                              }}
                              className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                              aria-label="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <p
                            className={`break-words font-semibold ${
                              task.done
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {task.text}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                                priorityStyles[task.priority] ||
                                priorityStyles.medium
                              }`}
                            >
                              {task.priority || "medium"} priority
                            </span>
                            {task.createdAt && (
                              <span className="text-xs text-slate-400">
                                Added{" "}
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editingId !== task._id && (
                      <div className="flex shrink-0 items-center gap-1">
                        <select
                          value={task.priority || "medium"}
                          onChange={(event) =>
                            changePriority(task, event.target.value)
                          }
                          title="Change priority"
                          aria-label={`Priority for ${task.text}`}
                          className="max-w-[94px] rounded-lg border border-slate-100 bg-white px-2 py-2 text-xs text-slate-500 outline-none focus:border-violet-300 sm:max-w-none"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <button
                          onClick={() => {
                            setEditingId(task._id);
                            setEditText(task.text || "");
                          }}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                          aria-label="Edit task"
                          title="Edit task"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!loading && tasks.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                <span>Overall progress</span>
                <span>{completedCount} of {tasks.length} completed</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${styles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
