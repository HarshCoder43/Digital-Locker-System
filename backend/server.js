const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const lockerRoutes = require("./routes/lockerRoutes");
const rentalRoutes = require("./routes/rentalRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection cache
let cachedConnection = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing");
  }

  cachedConnection = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await cachedConnection;

    console.log("MongoDB Connected Successfully!");

    return mongoose.connection;
  } catch (error) {
    cachedConnection = null;

    console.log("MongoDB Connection Failed!");
    console.log(error.message);

    throw error;
  }
};

// Health check
app.get("/", async (req, res) => {
  try {
    await connectDB();

    res.json({
      message: "Digital Locker Backend is Running!",
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    res.status(500).json({
      message: "Digital Locker Backend is Running!",
      status: "Database Connection Failed",
      error: error.message,
    });
  }
});

// Connect to MongoDB before API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lockers", lockerRoutes);
app.use("/api/rentals", rentalRoutes);

// Local development
const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;