const express = require("express");
const Locker = require("../models/Locker");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL LOCKERS
router.get("/", protect, async (req, res) => {
  try {
    const lockers = await Locker.find().sort({ lockerNumber: 1 });

    res.json(lockers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lockers",
      error: error.message,
    });
  }
});

// CREATE LOCKER - ADMIN ONLY
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { lockerNumber } = req.body;

    if (!lockerNumber) {
      return res.status(400).json({
        message: "Locker number is required",
      });
    }

    const existingLocker = await Locker.findOne({ lockerNumber });

    if (existingLocker) {
      return res.status(400).json({
        message: "Locker already exists",
      });
    }

    const locker = await Locker.create({
      lockerNumber,
    });

    res.status(201).json({
      message: "Locker created successfully",
      locker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create locker",
      error: error.message,
    });
  }
});

// UPDATE LOCKER STATUS - ADMIN ONLY
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Available", "Occupied", "Maintenance"].includes(status)) {
      return res.status(400).json({
        message: "Invalid locker status",
      });
    }

    const locker = await Locker.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!locker) {
      return res.status(404).json({
        message: "Locker not found",
      });
    }

    res.json({
      message: "Locker status updated successfully",
      locker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update locker status",
      error: error.message,
    });
  }
});

// DELETE LOCKER - ADMIN ONLY
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const locker = await Locker.findByIdAndDelete(req.params.id);

    if (!locker) {
      return res.status(404).json({
        message: "Locker not found",
      });
    }

    res.json({
      message: "Locker deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete locker",
      error: error.message,
    });
  }
});

module.exports = router;