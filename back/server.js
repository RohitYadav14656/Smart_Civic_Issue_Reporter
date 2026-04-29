import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import issueRoutes from "./routes/issue.route.js";
import authorityRoutes from "./routes/authority.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ─── Security & Global Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, message: "Too many issue submissions. Please wait before trying again." },
});

app.use(globalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Civix API v1 is running 🚀", version: "1.0.0" });
});

// ─── API v1 Routes ────────────────────────────────────────────────────────────
app.use("/api/v1/issues", uploadLimiter, issueRoutes);
app.use("/api/v1/authority", authorityRoutes);

// ─── Legacy compatibility routes (kept so existing front-end doesn't break) ───
// These simply forward to the new routes internally — no data is lost.
import upload from "./config/multer.js";
import cloudinary from "./config/cloudinary.js";
import Uploadeddata from "./models/user.model.js";
import munciplitydata from "./models/munciplity.js";

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image is required" });
    const { name, address, pincode } = req.body;
    const stream = cloudinary.uploader.upload_stream({ folder: "uploads" }, async (error, result) => {
      if (error) return res.status(500).json({ error });
      try {
        const savedData = await Uploadeddata.create({ name, address, pincode, imageUrl: result.secure_url });
        res.json(savedData);
      } catch (dbError) {
        res.status(500).json({ error: dbError.message });
      }
    });
    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/data", async (req, res) => {
  try {
    const data = await Uploadeddata.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await Uploadeddata.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/munciplitysignup", async (req, res) => {
  const { username, pincode, password } = req.body;
  try {
    const savedDataofmunci = await munciplitydata.create({ username, pincode, password });
    res.json(savedDataofmunci);
  } catch (dbError) {
    res.status(500).json({ error: dbError.message });
  }
});

app.post("/munciplitylogin", async (req, res) => {
  const { pincode, password } = req.body;
  try {
    const authority = await munciplitydata.findOne({ pincode, password });
    if (!authority) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ success: true, token: "legacy-token", pincode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Connection ──────────────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "Civic" });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

connectDB();

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
  console.log(`🚀 Civix API running on http://localhost:${PORT}`);
  console.log(`   API v1: http://localhost:${PORT}/api/v1`);
});