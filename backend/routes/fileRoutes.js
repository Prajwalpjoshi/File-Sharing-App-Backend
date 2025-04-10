import express from "express";
import {
  UploadController,
  DownloadController,
  DeleteController,
  VerifyPasswordController,
} from "../controllers/uploadController.js";
import storage from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", storage.single("file"), UploadController);
router.get("/files/:fileId", DownloadController);
router.post("/files/:fileId/verify", VerifyPasswordController);
router.delete("/files/:fileId", DeleteController);

export default router;
