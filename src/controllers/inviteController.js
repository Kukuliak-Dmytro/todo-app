import { PrismaClient } from "@prisma/client";
import { inviteSchema, respondSchema } from "../validators/inviteSchemas.js";

const prisma = new PrismaClient();

function formatZodError(err) {
  if (err.errors && Array.isArray(err.errors)) {
    return err.errors.map(e => ({ code: e.code, field: e.path.join('.'), message: e.message }));
  }
  return [{ code: "invalid_input", field: "", message: "Invalid input." }];
}

export const invite = async (req, res) => {
  try {
    const { invitedUserEmail } = inviteSchema.parse(req.body);
    // Always global share: inviter is req.user.userId
    // Check if invited user exists
    const invitedUser = await prisma.user.findUnique({ where: { email: invitedUserEmail } });
    if (!invitedUser) return res.status(404).json({ error: "Invited user does not exist" });
    // Prevent duplicate invite (pending/accepted)
    const existing = await prisma.todoShare.findFirst({
      where: {
        inviterUserId: req.user.userId,
        invitedUserEmail,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });
    if (existing) return res.status(400).json({ error: "Invite already exists or is pending/accepted" });
    // Create invite
    const invite = await prisma.todoShare.create({
      data: {
        inviterUserId: req.user.userId,
        invitedUserEmail,
        permission: "read",
        status: "PENDING",
      },
    });
    res.status(201).json(invite);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const listInvites = async (req, res) => {
  try {
    const invites = await prisma.todoShare.findMany({
      where: { invitedUserEmail: req.user.email },
      orderBy: { createdAt: "desc" },
      include: { inviter: true },
    });
    res.json(invites);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const respondInvite = async (req, res) => {
  try {
    const inviteId = Number(req.params.id);
    const { status } = respondSchema.parse(req.body);
    // Find invite
    const invite = await prisma.todoShare.findUnique({ where: { id: inviteId } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.invitedUserEmail !== req.user.email) return res.status(403).json({ error: "Not your invite" });
    if (invite.status !== "PENDING") return res.status(400).json({ error: "Invite already responded to" });
    // Update status
    const updated = await prisma.todoShare.update({ where: { id: inviteId }, data: { status } });
    res.json(updated);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ errors: formatZodError(err) });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const listSharedTodos = async (req, res) => {
  try {
    // Find all accepted global shares for this user
    const shares = await prisma.todoShare.findMany({
      where: { invitedUserEmail: req.user.email, status: "ACCEPTED" },
      include: { inviter: true },
    });
    // For each share, get all todos of the inviter
    let todos = [];
    for (const share of shares) {
      const inviterTodos = await prisma.todo.findMany({
        where: { userId: share.inviterUserId },
        include: { tasks: true },
      });
      todos.push(...inviterTodos);
    }
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}; 