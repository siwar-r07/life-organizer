const mongoose = require("mongoose");

const PushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  subscription: {
    type: Object,
    required: true,
  },

  tasksEnabled: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "PushSubscription",
  PushSubscriptionSchema
);