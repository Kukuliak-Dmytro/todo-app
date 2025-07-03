import { PrismaClient } from "@prisma/client";
import { createTaskSchema, patchTaskSchema } from "../validators/taskSchemas.js";

const prisma = new PrismaClient();

function formatZodError(err) {
  if (err.errors && Array.isArray(err.errors)) {
    return err.errors.map(e => ({ code: e.code, field: e.path.join('.'), message: e.message }));
  }
  return [{ code: "invalid_input", field: "", message: "Invalid input." }];
}

export const listTasks = async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: { id: Number(req.params.todoId), userId: req.user.userId },
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    const tasks = await prisma.task.findMany({
      where: { todoId: todo.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: { id: Number(req.params.todoId), userId: req.user.userId },
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    const data = createTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        ...data,
        todoId: todo.id,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const patchTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const todo = await prisma.todo.findFirst({
      where: { id: task.todoId, userId: req.user.userId },
    });
    if (!todo) return res.status(404).json({ error: "Todo not found or not owned by user" });
    const data = patchTaskSchema.parse(req.body);
    const updated = await prisma.task.update({
      where: { id: task.id },
      data,
    });
    res.json(updated);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const todo = await prisma.todo.findFirst({
      where: { id: task.todoId, userId: req.user.userId },
    });
    if (!todo) return res.status(404).json({ error: "Todo not found or not owned by user" });
    await prisma.task.delete({ where: { id: task.id } });
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}; 