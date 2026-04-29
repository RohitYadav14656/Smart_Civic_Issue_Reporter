import Authority from "../models/authority.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── POST /api/v1/authority/signup ──────────────────────────────────────────
export const signup = async (req, res, next) => {
  try {
    const { username, pincode, password } = req.body;

    const existing = await Authority.findOne({ pincode });
    if (existing) return next(new AppError("Pincode already registered", 409));

    const authority = await Authority.create({ username, pincode, password });

    const token = signToken({ id: authority._id, pincode: authority.pincode, username: authority.username });

    res.status(201).json({
      success: true,
      message: "Authority registered successfully",
      token,
      data: {
        id: authority._id,
        username: authority.username,
        pincode: authority.pincode,
        role: authority.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/authority/login ────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { pincode, password } = req.body;

    const authority = await Authority.findOne({ pincode }).select("+password");
    if (!authority) return next(new AppError("Invalid pincode or password", 401));

    const isMatch = await authority.comparePassword(password);
    if (!isMatch) return next(new AppError("Invalid pincode or password", 401));

    if (!authority.isActive) return next(new AppError("Account has been deactivated", 403));

    const token = signToken({ id: authority._id, pincode: authority.pincode, username: authority.username });

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: authority._id,
        username: authority.username,
        pincode: authority.pincode,
        role: authority.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/authority/me ────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const authority = await Authority.findById(req.authority.id);
    if (!authority) return next(new AppError("Authority not found", 404));
    res.json({ success: true, data: authority });
  } catch (err) {
    next(err);
  }
};
