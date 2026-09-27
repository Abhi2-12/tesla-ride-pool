import { z } from "zod";

export const createFareSchema = z.object({
  poolId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  calculationData: z.unknown(),
});

export const updateFareSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  calculationData: z.unknown().optional(),
});

export const fareIdSchema = z.object({
  id: z.string().min(1),
});