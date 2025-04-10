import fileModel from "../models/fileModel.js";
import cloudinary from "../config/cloudinary.js";
import dotenv from "dotenv";
import fs from "fs";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

dotenv.config();

// 📤 Upload
export const UploadController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "file-sharing",
    });

    fs.unlinkSync(req.file.path); // Delete local temp file

    let hashedPassword = null;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(req.body.password, salt);
    }

    const file = await fileModel.create({
      path: result.secure_url,
      name: req.file.originalname,
      password: hashedPassword,
      cloudinaryId: result.public_id,
    });

    res.status(200).json({ id: file._id, path: result.secure_url });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// 📥 Download
export const DownloadController = async (req, res) => {
  const { fileId } = req.params;
  const { password } = req.query;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid file ID" });
  }

  try {
    const file = await fileModel.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.password) {
      if (!password)
        return res.status(401).json({ message: "Password is required" });

      const match = await bcrypt.compare(password, file.password);
      if (!match)
        return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ url: file.path, name: file.name });
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ message: "Download failed" });
  }
};

// 🗑️ Delete
export const DeleteController = async (req, res) => {
  const { fileId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid file ID" });
  }

  try {
    const file = await fileModel.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    await cloudinary.uploader.destroy(file.cloudinaryId, {
      resource_type: "raw",
    });
    await fileModel.findByIdAndDelete(fileId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

export const VerifyPasswordController = async (req, res) => {
  const { fileId } = req.params;
  const { password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid file ID" });
  }

  try {
    const file = await fileModel.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.password) {
      const match = await bcrypt.compare(password, file.password);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password" });
      }
    }

    res.status(200).json({ message: "Password verified" });
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};
