import express from "express";
import upload from "../config/multer.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  addComment,
  deleteIssue,
  getStats,
} from "../controllers/issue.controller.js";

const router = express.Router();

// Public routes
router.get("/stats", getStats);
router.get("/", getIssues);
router.get("/:id", getIssueById);
router.post("/", upload.single("image"), validate(["title", "description", "address", "pincode"]), createIssue);

// Protected routes (authority must be logged in)
router.patch("/:id/status", protect, validate(["status"]), updateIssueStatus);
router.post("/:id/comments", protect, addComment);
router.delete("/:id", protect, deleteIssue);

export default router;
