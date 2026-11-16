const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const mongoose = require("mongoose");
const Task = require("./models/task");
const PushSubscription = require("./models/PushSubscription");
const Note = require("./models/Note");
const Event = require("./models/Event");
const cron = require("node-cron");
const webpush = require("web-push");
const Habit = require("./models/Habit");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
webpush.setVapidDetails(
   "mailto:6lackxxxblack@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
const authRoutes = require("./routes/auth");
const verifyToken = require("./middleware/authMiddleware.js");
const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }

  }
});

/* MIDDLEWARE */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// ================= PUSH NOTIFICATIONS =================
// ================= PUSH NOTIFICATIONS =================

// Send the public VAPID key to the frontend
app.get("/api/notifications/vapid-public-key", (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
});

// Save or update a user's browser subscription
app.post("/api/notifications/subscribe", verifyToken, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        message: "Invalid push subscription",
      });
    }

    await PushSubscription.findOneAndUpdate(
      {
        userId: req.user.id,
        "subscription.endpoint": subscription.endpoint,
      },
      {
        $set: {
          subscription,
          tasksEnabled: true,
        },
        $setOnInsert: {
          userId: req.user.id,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({ message: "Push subscription saved successfully" });
  } catch (error) {
    console.error("PUSH SUBSCRIPTION ERROR:", error);
    res.status(500).json({
      message: "Failed to save push subscription",
    });
  }
});

// Enable or disable task push notifications
app.put("/api/notifications/tasks-preference", verifyToken, async (req, res) => {
  try {
    const { enabled } = req.body;

    await PushSubscription.updateMany(
      { userId: req.user.id },
      { $set: { tasksEnabled: enabled === true } }
    );

    res.json({ message: "Task notification preference updated" });
  } catch (error) {
    console.error("TASK NOTIFICATION PREFERENCE ERROR:", error);
    res.status(500).json({
      message: "Failed to update task notification preference",
    });
  }
});
/* TEST ROUTE */
app.get("/test", (req, res) => {
  res.send("SERVER TEST WORKS");
});

app.use("/auth", authRoutes)

app.get("/api/profile", verifyToken, async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select(
      "-password -refreshToken -resetPasswordToken -resetPasswordExpire -passwordChangeToken -passwordChangeExpire -pendingPassword -pendingEmail -emailChangeToken -emailChangeExpire"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {

    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to load profile"
    });

  }

});
app.put(
  "/api/profile/picture",
  verifyToken,
  upload.single("profilePicture"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded"
        });
      }

      const imageUrl =
        `http://localhost:5000/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          profilePicture: imageUrl
        },
       { new: true, runValidators: true }
      ).select(
        "-password -refreshToken -resetPasswordToken -resetPasswordExpire -passwordChangeToken -passwordChangeExpire -pendingPassword -pendingEmail -emailChangeToken -emailChangeExpire"
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.json(user);

    } catch (error) {

      console.error("PROFILE PICTURE ERROR:", error);

      res.status(500).json({
        message: "Failed to upload profile picture"
      });

    }

  }
);

app.put("/api/profile", verifyToken, async (req, res) => {

 
  try {

    const { username, bio } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters"
      });
    }

    if (username.trim().length > 20) {
      return res.status(400).json({
        message: "Username cannot exceed 20 characters"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        username: username.trim(),
        bio: bio?.trim() || ""
      },
     { returnDocument: "after", runValidators: true }
    ).select(
      "-password -refreshToken -resetPasswordToken -resetPasswordExpire -passwordChangeToken -passwordChangeExpire -pendingPassword -pendingEmail -emailChangeToken -emailChangeExpire"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {

    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to update profile"
    });

  }

});
//
// ================= TASK ROUTES =================
//

// GET all tasks
app.get("/api/tasks", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all notes for the logged-in user
app.get("/api/notes", verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// CREATE a note
app.post("/api/notes", verifyToken, async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
       color: req.body.color || "purple",
      userId: req.user.id,
    });

    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// UPDATE a note
app.put("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        title: req.body.title,
        content: req.body.content,
          color: req.body.color,
      },
      { returnDocument: "after" }

    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE a note
app.delete("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// CREATE task
app.post("/api/tasks", verifyToken, async (req, res) => {
  try {
   const task = new Task({
  text: req.body.text,
  priority: req.body.priority || "medium",
  user: req.user.id,
  createdAt: new Date()
});

    await task.save();

    res.json(task);
  } catch (error) {
    console.error("ADD TASK ERROR:", error);

    res.status(500).json({
      message: "Failed to add task"
    });
  }
});
// DELETE task
app.delete("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// UPDATE task (complete / uncomplete)



app.put("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (req.body.done !== undefined) {
      const completionDate = req.body.completionDate;

      if (
        !completionDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(completionDate)
      ) {
        return res.status(400).json({
          error: "A valid completion date is required",
        });
      }

      // Convert old Date values and newer strings
      // into the same YYYY-MM-DD format.
      const getDateKey = (value) => {
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          return value;
        }

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
          return null;
        }

        return parsed.toISOString().slice(0, 10);
      };

      // Normalize existing history without losing other days.
      const history = [
        ...new Set(
          (task.completionHistory || [])
            .map(getDateKey)
            .filter(Boolean)
        ),
      ];

      task.done = req.body.done;

      if (req.body.done === true) {
        if (!history.includes(completionDate)) {
          history.push(completionDate);
        }

        task.completedAt = new Date();
      } else {
        // Remove only the date being unchecked.
        const updatedHistory = history.filter(
          (date) => date !== completionDate
        );

        task.completedAt = null;

        task.completionHistory = updatedHistory;
      }

      if (req.body.done === true) {
        task.completionHistory = history;
      }
    }

    if (req.body.priority !== undefined) {
      task.priority = req.body.priority;
    }

    await task.save();

    res.json(task);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/events", verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      userId: req.user.id
    }).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({
      message: "Failed to get events"
    });
  }
});
app.post("/api/events", verifyToken, async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      description: req.body.description || "",
      date: req.body.date,
      color: req.body.color || "purple",
      reminderMinutes: req.body.reminderMinutes ?? null,
      reminderSent: false,
      userId: req.user.id
    });

    await event.save();

    res.json(event);
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to create event"
    });
  }
});

app.put("/api/events/:id", verifyToken, async (req, res) => {
  try {
    const existingEvent = await Event.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const updateData = {};

    if (req.body.title !== undefined) {
      updateData.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }

    if (req.body.date !== undefined) {
      updateData.date = req.body.date;
    }

    if (req.body.color !== undefined) {
      updateData.color = req.body.color;
    }

    if (req.body.reminderMinutes !== undefined) {
      updateData.reminderMinutes = req.body.reminderMinutes;
    }

    if (req.body.completed !== undefined) {
      updateData.completed = req.body.completed;
    }

    // Reset the reminder if its schedule changes.
    const dateChanged =
      req.body.date !== undefined &&
      new Date(req.body.date).getTime() !==
      new Date(existingEvent.date).getTime();

    const reminderChanged =
      req.body.reminderMinutes !== undefined &&
      Number(req.body.reminderMinutes) !==
      Number(existingEvent.reminderMinutes);

    if (req.body.reminderSent !== undefined) {
      updateData.reminderSent = req.body.reminderSent;
    }

    if (req.body.completed === true) {
      updateData.reminderSent = true;
    } else if (
      req.body.completed !== true &&
      (dateChanged || reminderChanged)
    ) {
      updateData.reminderSent = false;
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    res.json(event);

  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to update event"
    });
  }
});

app.delete("/api/events/:id", verifyToken, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json({
      message: "Event deleted"
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete event"
    });
  }
});
app.get("/api/habits", verifyToken, async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(habits);
  } catch (error) {
    console.error("GET HABITS ERROR:", error);

    res.status(500).json({
      message: "Failed to get habits"
    });
  }
});
app.post("/api/habits", verifyToken, async (req, res) => {
  try {
    const habit = new Habit({
      name: req.body.name,
      color: req.body.color || "purple",
      userId: req.user.id
    });

    await habit.save();

    res.json(habit);
  } catch (error) {
    console.error("CREATE HABIT ERROR:", error);

    res.status(500).json({
      message: "Failed to create habit"
    });
  }
});
app.put("/api/habits/:id/toggle", verifyToken, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found"
      });
    }

    const today = new Date().toISOString().split("T")[0];

    if (habit.completedDates.includes(today)) {
      habit.completedDates = habit.completedDates.filter(
        (date) => date !== today
      );
    } else {
      habit.completedDates.push(today);
    }

    await habit.save();

    res.json(habit);
  } catch (error) {
    console.error("TOGGLE HABIT ERROR:", error);

    res.status(500).json({
      message: "Failed to update habit"
    });
  }
});
app.delete("/api/habits/:id", verifyToken, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found"
      });
    }

    res.json({
      message: "Habit deleted"
    });
  } catch (error) {
    console.error("DELETE HABIT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete habit"
    });
  }
});
/* PROTECTED ROUTE */

app.get("/api/private", verifyToken, (req, res) => {
  res.json({ message: "This is protected data" });
});

 // ================= EVENT REMINDER SCHEDULER =================

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

 const events = await Event.find({
  reminderMinutes: { $ne: null },
  reminderSent: false,
  date: { $ne: null },
  completed: { $ne: true }
});

    for (const event of events) {
      const reminderTime =
        new Date(event.date).getTime() -
        Number(event.reminderMinutes) * 60 * 1000;

      if (reminderTime <= now.getTime()) {
        console.log("Reminder due:", event.title);

        // Don't mark it as sent here.
        // The frontend must display the notification first.
      }
    }
  } catch (error) {
    console.error("REMINDER SCHEDULER ERROR:", error);
  }
});
// ================= TASK REMINDERS =================

cron.schedule("* * * * *", async () => {
  try {
    const twoHoursAgo = new Date(
  Date.now() - 2 * 60 * 60 * 1000
);

 const tasks = await Task.find({
  done: false,
  reminderSent: false,
createdAt: { $lte: twoHoursAgo },
});

    console.log("TASKS FOUND:", tasks.length);

    tasks.forEach((task) => {
      console.log("TASK:", {
        text: task.text,
        done: task.done,
        reminderSent: task.reminderSent,
        user: task.user,
        createdAt: task.createdAt,
      });
    });

    for (const task of tasks) {
      const subscriptions = await PushSubscription.find({
        userId: task.user,
        tasksEnabled: true,
      });

      console.log("SUBSCRIPTIONS FOUND:", subscriptions.length);

      if (subscriptions.length === 0) continue;

      const payload = JSON.stringify({
        title: "Task Reminder",
        body: `Don't forget: ${task.text}`,
        url: "/tasks",
      });

      let sentSuccessfully = false;

      for (const item of subscriptions) {
        try {
          await webpush.sendNotification(
            item.subscription,
            payload
          );

          sentSuccessfully = true;
        } catch (error) {
          console.error("TASK PUSH ERROR:", error);

          if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.deleteOne({
              _id: item._id,
            });
          }
        }
      }

      if (sentSuccessfully) {
        task.reminderSent = true;
        await task.save();
      }
    }
  } catch (error) {
    console.error("TASK REMINDER CRON ERROR:", error);
  }
});
/* DATABASE CONNECTION */

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log("Database connection error:", err);
});

/* SECURITY SCANNER ROUTE */

app.post("/scan", async (req, res) => {

  const { url } = req.body;

  try {

    const response = await axios.get(url);
    const headers = response.headers;

    const report = {
      https: url.startsWith("https"),
      xFrameOptions: headers["x-frame-options"] || "Missing",
      contentSecurityPolicy: headers["content-security-policy"] || "Missing",
      server: headers["server"] || "Unknown"
    };

    res.json(report);

  } catch (error) {
    res.status(500).json({ error: "Could not scan website" });
  }

});

/* SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});