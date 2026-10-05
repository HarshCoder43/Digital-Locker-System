const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const lockerRoutes = require("./routes/lockerRoutes");
const rentalRoutes = require("./routes/rentalRoutes");

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use((req, res, next) => {
  // Disable browser/proxy caching for API responses
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  next();
});

app.use(express.json());

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/lockers", lockerRoutes);
app.use("/api/rentals", rentalRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Digital Locker Backend is Running!",
    status: "OK",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Not Connected",
  });
});

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed!");
    console.log(error.message);
  });

// ===============================
// LOCAL DEVELOPMENT
// ===============================

const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ===============================
// VERCEL EXPORT
// ===============================

module.exports = app;