import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/health/protected", authenticateToken, (req, res) => {
  res.json({ status: "ok", userId: req.user.userId });
});

export default router; 