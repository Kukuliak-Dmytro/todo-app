import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { listTasks, createTask, patchTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/todos/:todoId/tasks", listTasks);
router.post("/todos/:todoId/tasks", createTask);
router.patch("/tasks/:id", patchTask);
router.delete("/tasks/:id", deleteTask);

export default router; 