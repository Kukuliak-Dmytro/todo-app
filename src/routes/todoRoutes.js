import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo } from "../controllers/todoController.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/todos", listTodos);
router.post("/todos", createTodo);
router.get("/todos/:id", getTodo);
router.put("/todos/:id", updateTodo);
router.delete("/todos/:id", deleteTodo);

export default router; 