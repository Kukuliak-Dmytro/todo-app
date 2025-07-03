import { PrismaClient } from "@prisma/client";
import { createTodoSchema, updateTodoSchema } from "../validators/todoSchemas.js";

const prisma = new PrismaClient();

function formatZodError(err) {
  if (err.errors && Array.isArray(err.errors)) {
    return err.errors.map(e => ({ code: e.code, field: e.path.join('.'), message: e.message }));
  }
  return [{ code: "invalid_input", field: "", message: "Invalid input." }];
}

export const listTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      include: { tasks: true },
    });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getTodo = async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: { id: Number(req.params.id), userId: req.user.userId },
      include: { tasks: true },
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createTodo = async (req, res) => {
  try {
    const data = createTodoSchema.parse(req.body);
    const todo = await prisma.todo.create({
      data: {
        ...data,
        userId: req.user.userId,
      },
      include: { tasks: true },
    });
    res.status(201).json(todo);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const data = updateTodoSchema.parse(req.body);
    const todo = await prisma.todo.updateMany({
      where: { id: Number(req.params.id), userId: req.user.userId },
      data,
    });
    if (todo.count === 0) return res.status(404).json({ error: "Todo not found" });
    const updated = await prisma.todo.findUnique({ where: { id: Number(req.params.id) }, include: { tasks: true } });
    res.json(updated);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await prisma.todo.deleteMany({
      where: { id: Number(req.params.id), userId: req.user.userId },
    });
    if (todo.count === 0) return res.status(404).json({ error: "Todo not found" });
    res.json({ success: true, message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}; 