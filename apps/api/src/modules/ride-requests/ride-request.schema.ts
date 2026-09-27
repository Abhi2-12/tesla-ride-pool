import { z } from "zod";

export const createRideRequestSchema = z.object({
  userId: z.string().min(1),
  origin: z.string().trim().min(1).max(255),
  destination: z.string().trim().min(1).max(255),
  status: z.string().trim().min(1).max(50),
});

export const updateRideRequestSchema = z.object({
  origin: z.string().trim().min(1).max(255).optional(),
  destination: z.string().trim().min(1).max(255).optional(),
  status: z.string().trim().min(1).max(50).optional(),
});

export const rideRequestIdSchema = z.object({
  id: z.string().min(1),
});