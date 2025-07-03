import { z } from "zod";

export const createTaskSchema = z.object({
  content: z.string().min(1, "Content is required"),
  completed: z.boolean().optional(),
});

export const patchTaskSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  completed: z.boolean().optional(),
}); 