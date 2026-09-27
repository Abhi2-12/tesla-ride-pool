import { z } from "zod";

export const createPoolSchema = z.object({
  vehicleId: z.string().min(1),
  creatorId: z.string().min(1),
  capacity: z.number().int().positive(),
  state: z.string().trim().min(1).max(50),
});

export const updatePoolSchema = z.object({
  capacity: z.number().int().positive().optional(),
  state: z.string().trim().min(1).max(50).optional(),
});

export const poolIdSchema = z.object({
  id: z.string().min(1),
});