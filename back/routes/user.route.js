import express from "express";
import upload from "./multer.js";
import cloudinary from "./cloudinary.js";

const router = express.Router();

// POST /upload
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { name, address } = req.body;

    // upload buffer to cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (error) {
          console.log("Cloudinary error:", error);
          return res.status(500).json({ error });
        }

        const response = {
          name,
          address,
          imageUrl: result.secure_url
        };

        console.log("UPLOAD SUCCESS:", response);

        res.json(response);
      }
    );

    stream.end(req.file.buffer);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;