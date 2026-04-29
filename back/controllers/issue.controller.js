import Issue from "../models/issue.model.js";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── POST /api/v1/issues ─────────────────────────────────────────────────────
export const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, address, pincode, reporterName, reporterEmail, lat, lng } = req.body;

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "civix/issues",
            transformation: [{ quality: "auto:good", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      address,
      pincode,
      reporterName,
      reporterEmail,
      imageUrl,
      imagePublicId,
      location: {
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
    });

    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/issues ──────────────────────────────────────────────────────
// Supports: ?pincode=&status=&category=&page=&limit=&search=
export const getIssues = async (req, res, next) => {
  try {
    const { pincode, status, category, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (pincode) filter.pincode = pincode;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-imagePublicId -__v");

    res.json({
      success: true,
      data: issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/issues/:id ──────────────────────────────────────────────────
export const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).select("-imagePublicId -__v");
    if (!issue) return next(new AppError("Issue not found", 404));
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/issues/:id/status ────────────────────────────────────────
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const validStatuses = ["pending", "in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status value", 400));
    }

    const update = { status };
    if (status === "resolved") update.resolvedAt = new Date();

    const issue = await Issue.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!issue) return next(new AppError("Issue not found", 404));

    // Optionally add a comment alongside status update
    if (comment && comment.trim()) {
      issue.comments.push({ text: comment.trim(), author: req.authority?.username || "Authority" });
      await issue.save();
    }

    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/issues/:id/comments ───────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return next(new AppError("Comment text is required", 400));

    const issue = await Issue.findById(req.params.id);
    if (!issue) return next(new AppError("Issue not found", 404));

    issue.comments.push({ text: text.trim(), author: req.authority?.username || "Authority" });
    await issue.save();

    res.status(201).json({ success: true, data: issue.comments });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/issues/:id ───────────────────────────────────────────────
export const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return next(new AppError("Issue not found", 404));

    // Remove from Cloudinary if stored
    if (issue.imagePublicId) {
      await cloudinary.uploader.destroy(issue.imagePublicId).catch(() => {});
    }

    res.json({ success: true, message: "Issue deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/issues/stats ─────────────────────────────────────────────────
export const getStats = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const match = pincode ? { pincode } : {};

    const stats = await Issue.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Issue.aggregate([
      { $match: match },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = await Issue.countDocuments(match);

    const statusMap = { pending: 0, in_progress: 0, resolved: 0, rejected: 0 };
    stats.forEach((s) => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        total,
        byStatus: statusMap,
        byCategory: categoryStats,
      },
    });
  } catch (err) {
    next(err);
  }
};
