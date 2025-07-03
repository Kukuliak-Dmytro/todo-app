import { z } from "zod";

export const inviteSchema = z.object({
  invitedUserEmail: z.string().email("Valid email required"),
});

export const respondSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
}); 