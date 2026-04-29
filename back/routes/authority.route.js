import express from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { signup, login, getMe } from "../controllers/authority.controller.js";

const router = express.Router();

router.post("/signup", validate(["username", "pincode", "password"]), signup);
router.post("/login", validate(["pincode", "password"]), login);
router.get("/me", protect, getMe);

export default router;
