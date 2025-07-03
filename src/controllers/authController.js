import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema } from "../validators/authSchemas.js";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

function formatZodError(err) {
  if (err.errors && Array.isArray(err.errors)) {
    return err.errors.map(e => ({ code: e.code, field: e.path.join('.'), message: e.message }));
  }
  return [{ code: "invalid_input", field: "", message: "Invalid input." }];
}

export const register = async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const tokens = generateTokens(user.id);
    res.status(201).json(tokens);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const tokens = generateTokens(user.id);
    res.json(tokens);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });
  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: "Invalid refresh token" });
    const tokens = generateTokens(payload.userId);
    res.json(tokens);
  });
}; 