const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // "user" for everyone; "admin" for the single owner account (set via seed script only)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
