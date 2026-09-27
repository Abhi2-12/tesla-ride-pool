import { z } from "zod";

export const createVehicleSchema = z.object({
  ownerId: z.string().min(1),
  type: z.string().trim().min(1).max(50),
  capacity: z.number().int().positive(),
});

export const updateVehicleSchema = z.object({
  type: z.string().trim().min(1).max(50).optional(),
  capacity: z.number().int().positive().optional(),
});

export const vehicleIdSchema = z.object({
  id: z.string().min(1),
});