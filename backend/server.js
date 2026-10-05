const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const lockerRoutes = require("./routes/lockerRoutes");
const rentalRoutes = require("./routes/rentalRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lockers", lockerRoutes);
app.use("/api/rentals", rentalRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Digital Locker Backend is Running!",
    status: "OK",
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed!");
    console.log(error.message);
  });

// Local development
const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;