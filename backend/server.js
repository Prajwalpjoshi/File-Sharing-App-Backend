import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
connectDB();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes
app.use("/api/user", userRoutes);
app.use("/", fileRoutes);

// ✅ Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend is working fine!" });
});

// ✅ Error Handling
app.use(notFound);
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`.yellow.bold);
});
