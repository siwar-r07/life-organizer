const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  date: {
    type: Date,
    required: true
  },
  reminderMinutes: {
    type: Number,
    default: null
  },

  reminderSent: {
    type: Boolean,
    default: false
  },
 color: {
  type: String,
  default: "purple"
},
completed: {
  type: Boolean,
  default: false
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", eventSchema);