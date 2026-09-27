import { z } from "zod";

export const rideHistoryIdSchema = z.object({
  id: z.string().min(1),
});

export const poolHistoryParamsSchema = z.object({
  poolId: z.string().min(1),
});

export const createRideHistorySchema = z.object({
  poolId: z.string().min(1),
  oldState: z.string().trim().min(1).max(50),
  newState: z.string().trim().min(1).max(50),
  changedBy: z.string().min(1),
});
