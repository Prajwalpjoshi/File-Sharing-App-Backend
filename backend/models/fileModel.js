import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  path: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String },
  cloudinaryId: { type: String, required: true },
});

export default mongoose.model("file", fileSchema);
