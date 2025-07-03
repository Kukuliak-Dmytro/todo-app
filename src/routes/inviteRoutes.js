import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { invite, listInvites, respondInvite, listSharedTodos } from "../controllers/inviteController.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/todos/:id/invite", invite);
router.get("/invites", listInvites);
router.post("/invites/:id/respond", respondInvite);
router.get("/shared-todos", listSharedTodos);

export default router; 