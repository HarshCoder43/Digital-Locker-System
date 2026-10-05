const express = require("express");
const Rental = require("../models/Rental");
const Locker = require("../models/Locker");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   STUDENT - RENT LOCKER
========================================= */

router.post("/", protect, async (req, res) => {
  try {
    const {
      lockerId,
      startDate,
      endDate,
    } = req.body;

    if (!lockerId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Locker ID, start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message:
          "End date must be after start date",
      });
    }

    const locker =
      await Locker.findById(lockerId);

    if (!locker) {
      return res.status(404).json({
        message: "Locker not found",
      });
    }

    if (locker.status !== "Available") {
      return res.status(400).json({
        message:
          "Locker is not available",
      });
    }

    const existingRental =
      await Rental.findOne({
        locker: lockerId,
        startDate: { $lt: end },
        endDate: { $gt: start },
      });

    if (existingRental) {
      return res.status(400).json({
        message:
          "Locker is already rented for this period",
      });
    }

    const rental =
      await Rental.create({
        locker: lockerId,
        student: req.user.id,
        startDate: start,
        endDate: end,
      });

    locker.status = "Occupied";

    await locker.save();

    res.status(201).json({
      message:
        "Locker rented successfully",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Rental creation failed",
      error: error.message,
    });
  }
});

/* =========================================
   STUDENT - MY RENTALS
========================================= */

router.get("/my", protect, async (req, res) => {
  try {
    const rentals =
      await Rental.find({
        student: req.user.id,
      })
        .populate("locker")
        .sort({
          createdAt: -1,
        });

    res.json(rentals);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch rentals",
      error: error.message,
    });
  }
});

/* =========================================
   ADMIN - ALL RENTALS
========================================= */

router.get(
  "/admin/all",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const rentals =
        await Rental.find()
          .populate(
            "locker",
            "lockerNumber status"
          )
          .populate(
            "student",
            "name email"
          )
          .sort({
            endDate: 1,
          });

      const now = new Date();

      const formattedRentals =
        rentals.map((rental) => {
          const endDate =
            new Date(rental.endDate);

          const startDate =
            new Date(rental.startDate);

          const remainingMs =
            endDate.getTime() -
            now.getTime();

          let rentalStatus = "Active";

          if (remainingMs <= 0) {
            rentalStatus = "Expired";
          } else if (
            endDate.toDateString() ===
            now.toDateString()
          ) {
            rentalStatus = "Ends Today";
          }

          return {
            _id: rental._id,

            locker: rental.locker,

            student: rental.student,

            startDate,

            endDate,

            rentalStatus,

            remainingMs:
              Math.max(
                remainingMs,
                0
              ),
          };
        });

      res.json(formattedRentals);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch admin rentals",
        error: error.message,
      });
    }
  }
);

module.exports = router;