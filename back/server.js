import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import upload from "./config/multer.js";
import cloudinary from "./config/cloudinary.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));

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
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, address } = req.body;
    

    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (error) {
          console.log("Cloudinary error:", error);
          return res.status(500).json({ error });
        }

        const responseData = {
          name,
          address,
          imageUrl: result.secure_url
        };

        console.log("UPLOAD SUCCESS:", responseData);

        res.json(responseData);
      }
    );

    stream.end(req.file.buffer);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
console.log("CLOUD NAME:", process.env.CLOUD_NAME);

// start server
const PORT = process.env.PORT || 3050;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});