import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  role: z.string().trim().min(1).max(50),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdSchema = z.object({
  id: z.string().min(1),
});