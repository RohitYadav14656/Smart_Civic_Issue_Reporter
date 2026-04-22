import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import upload from "./config/multer.js";
import cloudinary from "./config/cloudinary.js";
import Uploadeddata from "./models/user.model.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { name, address } = req.body;

    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      async (error, result) => {
        if (error) {
          console.log("Cloudinary error:", error);
          return res.status(500).json({ error });
        }

        try {
          // ✅ SAVE TO MONGODB
          const savedData = await Uploadeddata.create({
            name,
            address,
            imageUrl: result.secure_url,
          });

          console.log("SAVED IN DB:", savedData);

          res.json(savedData);
        } catch (dbError) {
          console.log("DB ERROR:", dbError);
          res.status(500).json({ error: dbError.message });
        }
      }
    );

    stream.end(req.file.buffer);

  } catch (err) {
    console.log("SERVER ERROR:", err);
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
    const { id } = req.params;

    const deleted = await Upload.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json({ message: "Deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// connect DB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Civic",
    });
    console.log("✅ Connected successfully");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}
connectDB();

// start server
const PORT = process.env.PORT || 3050;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});