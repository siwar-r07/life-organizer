const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
  },

  password: {
    type: String,
    required: true,
    minlength: 8
  },

  refreshToken: {
    type: String,
    default: null
  },

  profilePicture: {
    type: String,
    default: ""
  },

  bio: {
    type: String,
    default: ""
  },

  resetPasswordToken: String,
resetPasswordExpire: Date,

passwordChangeToken: String,
passwordChangeExpire: Date,
pendingPassword: String,

pendingEmail: {
  type: String,
  lowercase: true,
  trim: true,
  default: null
},
emailChangeToken: String,
emailChangeExpire: Date
}, { timestamps: true });

module.exports =
  mongoose.models.User || mongoose.model("User", UserSchema);