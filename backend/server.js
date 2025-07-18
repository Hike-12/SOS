const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
require("dotenv").config();
const interviewRoutes = require("./routes/interviewRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const fetchAndSaveJobs = require("./controllers/jobsfetch"); // Import the job fetcher
const emailRoute = require("./routes/emailRoute");

// Connect to database
connectDB().then(() => {
  console.log("✅ MongoDB connected.");

  // Trigger the job fetcher after MongoDB connection
  fetchAndSaveJobs();
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://zenith-sos.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/email", emailRoute); 
const skillMapData = require("./skillmap-data.json");

app.get("/api/skillmap", (req, res) => {
  res.json(skillMapData);
});

app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/soft-skills", require("./routes/softSkillsRoutes"));
app.use("/api/interview", interviewRoutes);
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/moat", require("./routes/moatRoutes"));
app.use("/api/achievements", achievementRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    database: "Connected",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

// 404 handler - must be last
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});