const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    locker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Locker",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Rental = mongoose.model("Rental", rentalSchema);

module.exports = Rental;