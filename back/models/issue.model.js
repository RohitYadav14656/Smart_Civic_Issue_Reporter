import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, default: "Authority" },
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "pothole",
        "garbage",
        "water_leakage",
        "streetlight",
        "sewage",
        "road_damage",
        "other",
      ],
      default: "other",
    },
    address: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null }, // for cloudinary deletion
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    reporterName: { type: String, trim: true, default: "Anonymous" },
    reporterEmail: { type: String, trim: true, default: null },
    comments: [commentSchema],
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for fast pincode-based filtering (used by authority dashboard)
issueSchema.index({ pincode: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
