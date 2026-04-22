import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    imageUrl: String,
  },
  { timestamps: true }
);

const Uploadeddata = mongoose.model("Upload", uploadSchema);

export default Uploadeddata;