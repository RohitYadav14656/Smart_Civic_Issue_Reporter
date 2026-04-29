import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const authoritySchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["authority", "admin"], default: "authority" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
authoritySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare plain-text password with stored hash
authoritySchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const Authority = mongoose.model("Authority", authoritySchema);
export default Authority;
