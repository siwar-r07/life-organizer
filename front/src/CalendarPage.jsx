import React, { useEffect, useMemo,useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  Clock,
  Check,
  FileText,
  LoaderCircle,
} from "lucide-react";
import api from "./api";

const eventColors = [
  { name: "purple", hex: "#a855f7", dot: "bg-purple-500", light: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "pink", hex: "#ec4899", dot: "bg-pink-500", light: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "blue", hex: "#3b82f6", dot: "bg-blue-500", light: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "green", hex: "#10b981", dot: "bg-emerald-500", light: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { name: "yellow", hex: "#f59e0b", dot: "bg-amber-500", light: "bg-amber-100 text-amber-700 border-amber-200" },
];
const pad = (number) => String(number).padStart(2, "0");

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toLocalInput = (date = new Date()) =>
  `${dateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (value) =>
  new Date(value).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const emptyForm = () => ({
  title: "",
  description: "",
  date: toLocalInput(),
  color: "purple",
  reminderMinutes: 10,
});

function CalendarPage() {
  const today = new Date();

  const [events, setEvents] = useState([]);
  const [notificationPermission, setNotificationPermission] =
  useState(Notification.permission);
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("notificationSettings")
    );

    return settings?.events ?? true;
  } catch {
    return true;
  }
});
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
const notifiedReminders = useRef(new Set());
  const monthLabel = currentMonth.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const fetchEvents = async () => {
    try {
      setError("");
      const response = await api.get("/api/events");
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Couldn't load your events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

useEffect(() => {
  const syncEventNotifications = () => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("notificationSettings")
      );

      setRemindersEnabled(settings?.events ?? true);
    } catch {
      setRemindersEnabled(true);
    }
  };

  window.addEventListener(
    "storage",
    syncEventNotifications
  );
window.addEventListener(
  "notificationSettingsChanged",
  syncEventNotifications
);
  // Also check when returning to the calendar.
  window.addEventListener(
    "focus",
    syncEventNotifications
  );

  return () => {
    window.removeEventListener(
      "storage",
      syncEventNotifications
    );
window.removeEventListener(
  "notificationSettingsChanged",
  syncEventNotifications
);
    window.removeEventListener(
      "focus",
      syncEventNotifications
    );
  };
}, []);

useEffect(() => {
  if (!remindersEnabled) return;

  const checkReminders = () => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const now = Date.now();

    events.forEach((event) => {
      if (event.completed) return;
      const eventId = event._id;

      if (
        !eventId ||
        event.reminderMinutes == null ||
        event.reminderSent ||
        !event.date ||
        notifiedReminders.current.has(eventId)
      ) {
        return;
      }

      const reminderTime =
        new Date(event.date).getTime() -
        Number(event.reminderMinutes) * 60 * 1000;

      if (reminderTime <= now && reminderTime > now - 60000) {
        // Record it before displaying the notification.
        notifiedReminders.current.add(eventId);

        // Update the frontend immediately.
        setEvents((previous) =>
          previous.map((item) =>
            item._id === eventId
              ? { ...item, reminderSent: true }
              : item
          )
        );

        new Notification(`Upcoming event: ${event.title}`, {
          body: `Your event starts at ${formatTime(event.date)}.`,
         tag: `event-reminder-${eventId}-${Date.now()}`,
        });
      }
    });
  };

  checkReminders();

  const interval = setInterval(checkReminders, 15000);

  return () => clearInterval(interval);
}, [events, remindersEnabled]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      let date;
      let outside = false;

      if (index < firstDay) {
        date = new Date(year, month - 1, previousMonthDays - firstDay + index + 1);
        outside = true;
      } else if (index >= firstDay + daysInMonth) {
        date = new Date(year, month + 1, index - firstDay - daysInMonth + 1);
        outside = true;
      } else {
        date = new Date(year, month, index - firstDay + 1);
      }

      return {
        date,
        key: dateKey(date),
        outside,
      };
    });
  }, [currentMonth]);

  const getEventDateKey = (event) => {
    if (!event.date) return "";
    const date = new Date(event.date);
    return Number.isNaN(date.getTime()) ? "" : dateKey(date);
  };

  const selectedEvents = events
    .filter((event) => getEventDateKey(event) === selectedDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));


  const upcomingEvents = events
    .filter(
      (event) =>
        event.date &&
        new Date(event.date) >= new Date(`${dateKey(today)}T00:00:00`) &&
        event.completed !== true
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);


  const openNewEvent = () => {
    setForm({
      ...emptyForm(),
      date: `${selectedDate}T09:00`,
    });
    setEditingId(null);
    setError("");
    setShowEditor(true);
  };

  const openEditEvent = (event) => {
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: toLocalInput(new Date(event.date)),
      color: event.color || "purple",
      reminderMinutes: event.reminderMinutes ?? 10,
    });
    setEditingId(event._id);
    setError("");
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const saveEvent = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.date) {
      setError("Please enter an event title and date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

  const eventData = {
  title: form.title.trim(),
  description: form.description.trim(),
  date: new Date(form.date).toISOString(),
  color: form.color,
  reminderMinutes:
    form.reminderMinutes === "" || form.reminderMinutes === null
      ? null
      : Number(form.reminderMinutes),
};

    if (editingId) {
  const existingEvent = events.find(
    (event) => event._id === editingId
  );

  const reminderScheduleChanged =
    existingEvent &&
    (
      new Date(existingEvent.date).getTime() !==
        new Date(eventData.date).getTime() ||
      existingEvent.reminderMinutes !== eventData.reminderMinutes
    );

  const updateData = reminderScheduleChanged
    ? { ...eventData, reminderSent: false }
    : eventData;

  const response = await api.put(
    `/api/events/${editingId}`,
    updateData
  );

  if (reminderScheduleChanged) {
    notifiedReminders.current.delete(editingId);
  }

  setEvents((previous) =>
    previous.map((event) =>
      event._id === editingId ? response.data : event
    )
  );
} else {
        const response = await api.post("/api/events", eventData);
        setEvents((previous) => [...previous, response.data]);
      }

      setSelectedDate(dateKey(new Date(eventData.date)));
      setCurrentMonth(
        new Date(
          new Date(eventData.date).getFullYear(),
          new Date(eventData.date).getMonth(),
          1
        )
      );
      closeEditor();
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Couldn't save the event. Please try again.");
    } finally {
      setSaving(false);
    }
  };


const toggleNotifications = () => {
  setRemindersEnabled((prev) => {
    const enabled = !prev;

    let settings = {};

    try {
      settings =
        JSON.parse(localStorage.getItem("notificationSettings")) || {};
    } catch {
      settings = {};
    }

    localStorage.setItem(
      "notificationSettings",
      JSON.stringify({
        ...settings,
        events: enabled,
      })
    );

    window.dispatchEvent(
      new Event("notificationSettingsChanged")
    );

    return enabled;
  });
};


  const deleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setDeleting(true);
      setError("");
      await api.delete(`/api/events/${eventToDelete._id}`);
      setEvents((previous) =>
        previous.filter((event) => event._id !== eventToDelete._id)
      );
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Couldn't delete this event. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

const toggleEventCompleted = async (event) => {
  const completed = event.completed !== true;

  console.log("EVENT CURRENT STATUS:", event.completed);
  console.log("SENDING COMPLETED:", completed);

  try {
    setError("");

    const response = await api.put(`/api/events/${event._id}`, {
      completed,
    });
if (completed) {
  notifiedReminders.current.add(event._id);
} else {
  notifiedReminders.current.delete(event._id);
}
    console.log("BACKEND RESPONSE:", response.data);

    setEvents((previous) =>
      previous.map((item) =>
        item._id === event._id
          ? { ...item, ...response.data, completed }
          : item
      )
    );
  } catch (err) {
    console.error("Error updating event status:", err);
    setError("Couldn't update the event status. Please try again.");
  }
};
  const changeMonth = (amount) => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + amount, 1)
    );
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(dateKey(now));
  };

  const getColor = (color) =>
    eventColors.find((item) => item.name === color) || eventColors[0];

  return (
  <div className="calendar-page min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-500">
              Make room for what matters
            </p>
            <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
              My Calendar <span className="text-purple-500">✦</span>
            </h1>
            <p className="mt-2 text-gray-500">
              Organize your days and upcoming events.
            </p>
          </div>

          <button
            onClick={openNewEvent}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5"
          >
            <Plus size={19} />
            Add event
          </button>
          
<button
  type="button"
  onClick={toggleNotifications}
  className="rounded-2xl bg-purple-100 px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-200"
>
  {remindersEnabled
  ? "Disable reminders"
  : "Enable reminders"}
</button>

        </header>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <CalendarDays size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">All events</p>
                <p className="text-2xl font-bold text-gray-800">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-pink-100 p-3 text-pink-600">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Selected day</p>
                <p className="text-lg font-bold text-gray-800">
                  {selectedEvents.length}{" "}
                  {selectedEvents.length === 1 ? "event" : "events"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <CalendarDays size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Coming up</p>
                <p className="text-lg font-bold text-gray-800">
                  {upcomingEvents.length}{" "}
                  {upcomingEvents.length === 1 ? "event" : "events"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
          <section className="rounded-3xl border border-purple-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{monthLabel}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a day to see your plans
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="rounded-xl border border-purple-100 px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Today
                </button>
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-purple-50"
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-purple-50"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-gray-400 sm:text-sm"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map(({ date, key, outside }) => {
                const isSelected = key === selectedDate;
                const isToday = key === dateKey(today);
                const dayEvents = events.filter(
                  (event) => getEventDateKey(event) === key
                );

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDate(key);
                      if (outside) {
                        setCurrentMonth(
                          new Date(date.getFullYear(), date.getMonth(), 1)
                        );
                      }
                    }}
                    className={`relative flex min-h-16 flex-col items-center rounded-xl border p-1.5 transition sm:min-h-20 sm:p-2 ${
                      isSelected
                        ? "border-purple-500 bg-purple-600 text-white shadow-md shadow-purple-200"
                        : isToday
                          ? "border-purple-300 bg-purple-50 text-purple-700"
                          : "border-transparent text-gray-700 hover:border-purple-100 hover:bg-purple-50"
                    } ${outside ? "opacity-40" : ""}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold sm:h-8 sm:w-8 ${
                        isToday && !isSelected ? "bg-purple-100" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="mt-1 flex min-h-2 flex-wrap justify-center gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event._id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-white" : getColor(event.color).dot
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
              {eventColors.map((color) => (
                <div key={color.name} className="flex items-center gap-2">
                 <span
  className="h-2.5 w-2.5 rounded-full"
  style={{ backgroundColor: color.hex }}
/>
                  <span className="capitalize">{color.name}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-purple-500">
                    YOUR SCHEDULE
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-800">
                    {new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h2>
                </div>
                <button
                  onClick={openNewEvent}
                  aria-label="Add event on selected day"
                  className="rounded-xl bg-purple-100 p-2.5 text-purple-700 transition hover:bg-purple-200"
                >
                  <Plus size={19} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
                  <LoaderCircle size={20} className="animate-spin" />
                  Loading events...
                </div>
              ) : selectedEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 px-4 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-purple-500">
                    <CalendarDays size={24} />
                  </div>
                  <p className="font-semibold text-gray-700">Nothing planned yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add an event to this day.
                  </p>
                  <button
                    onClick={openNewEvent}
                    className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800"
                  >
                    + Create an event
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <article
                      key={event._id}
                 
className={`calendar-event-card rounded-2xl border p-4 transition hover:shadow-sm ${
  event.completed
  ? "opacity-75 grayscale-[25%] shadow-inner"
  : "hover:-translate-y-0.5"
} ${
  event.color === "purple" ? "bg-purple-100 border-purple-200" :
  event.color === "pink" ? "bg-pink-100 border-pink-200" :
  event.color === "blue" ? "bg-blue-100 border-blue-200" :
  event.color === "green" ? "bg-emerald-100 border-emerald-200" :
  event.color === "yellow" ? "bg-amber-100 border-amber-200" :
  "bg-purple-100 border-purple-200"
}`}

                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${
                            getColor(event.color).dot
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3
  className={`break-words font-bold transition-all ${
    event.completed
      ? "text-gray-500 line-through decoration-2"
      : "text-gray-800"
  }`}
>
  {event.title}
</h3>
{event.completed && (
  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
    <Check size={12} />
    Completed
  </span>
)}
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={13} />
                            {formatTime(event.date)}
                          </p>
                          {event.description && (
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                              {event.description}
                            </p>
                          )}
                        </div>
                       
<div className="flex gap-1">
  <button
    onClick={() => toggleEventCompleted(event)}
    aria-label={event.completed ? "Mark event as not done" : "Mark event as done"}
    title={event.completed ? "Mark as not done" : "Mark as done"}
    className={`rounded-lg p-2 transition ${
      event.completed
        ? "bg-emerald-100 text-emerald-700"
        : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
    }`}
  >
    <Check size={16} />
  </button>

  <button
    onClick={() => openEditEvent(event)}
    aria-label="Edit event"
    className="rounded-lg p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600"
  >
    <Pencil size={16} />
  </button>

  <button
    onClick={() => setEventToDelete(event)}
    aria-label="Delete event"
    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
  >
    <Trash2 size={16} />
  </button>
</div>

                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50 p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-800">
                Coming up next
              </h2>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No upcoming events. Enjoy some free time!
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => {
                        const date = new Date(event.date);
                        setCurrentMonth(
                          new Date(date.getFullYear(), date.getMonth(), 1)
                        );
                        setSelectedDate(dateKey(date));
                      }}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          getColor(event.color).dot
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-semibold text-gray-800">
                          {event.title}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {formatDate(event.date)} · {formatTime(event.date)}
                        </span>
                      </span>
                      <ChevronRight size={16} className="mt-1 shrink-0 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {showEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm">
            <form
              onSubmit={saveEvent}
              className="my-auto w-full max-w-lg rounded-3xl border border-purple-100 bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-purple-500">
                    YOUR PLANS
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-800">
                    {editingId ? "Edit event" : "Create an event"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  aria-label="Close event form"
                  className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Event title *
              </label>
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Doctor appointment"
                className="mb-5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
              />

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Date and time *
              </label>
              <input
                required
                type="datetime-local"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                className="mb-5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
              />

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Add details (optional)..."
                className="mb-5 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
              />

              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Event color
              </label>
              <div className="mb-7 flex flex-wrap gap-3">
                {eventColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setForm({ ...form, color: color.name })}
                    aria-label={`Choose ${color.name}`}
                    title={color.name}
                  className={`calendar-color-option h-9 w-9 rounded-full border-2 ${
  color.dot
} ${
                      form.color === color.name
                        ? "border-gray-800 ring-2 ring-purple-300 ring-offset-2"
                        : "border-transparent"
                    }`}
                  />
                ))}
              </div>
<label className="mb-2 block text-sm font-semibold text-gray-700">
  Reminder
</label>

<select
  value={form.reminderMinutes ?? ""}
  onChange={async (e) => {
  const value =
    e.target.value === "" ? null : Number(e.target.value);

  if (
    value !== null &&
    "Notification" in window &&
    Notification.permission === "default"
  ) {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  setForm({
    ...form,
    reminderMinutes: value,
  });
}}
  className="mb-7 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
>
  <option value="">No reminder</option>
  <option value="5">5 minutes before</option>
  <option value="10">10 minutes before</option>
  <option value="30">30 minutes before</option>
  <option value="60">1 hour before</option>
  <option value="1440">1 day before</option>
</select>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 font-semibold text-white shadow-md disabled:opacity-60"
                >
                  {saving && <LoaderCircle size={17} className="animate-spin" />}
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {eventToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-purple-100 bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Trash2 size={25} />
              </div>
              <h2 className="text-center text-xl font-bold text-gray-800">
                Delete this event?
              </h2>
              <p className="mt-2 break-words text-center text-sm leading-6 text-gray-500">
                Are you sure you want to delete "{eventToDelete.title}"? This
                cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setEventToDelete(null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={deleteEvent}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;
