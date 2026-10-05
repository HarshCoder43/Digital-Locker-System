const mongoose = require("mongoose");

const lockerSchema = new mongoose.Schema(
  {
    lockerNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

const Locker = mongoose.model("Locker", lockerSchema);

module.exports = Locker;