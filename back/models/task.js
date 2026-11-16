const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  done: {
    type: Boolean,
    default: false,
  },
priority: {
  type: String,
  enum: ["low", "medium", "high"],
  default: "medium"
},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
  type: Date,
  default: Date.now
},
completedAt: {
  type: Date,
  default: null,
},

completionHistory: {
  type: [String],
  default: [],
},
reminderSent: { type: Boolean, default: false }, 
});

module.exports = mongoose.model("Task", TaskSchema);