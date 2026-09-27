import { z } from "zod";

export const createMembershipSchema = z.object({
  poolId: z.string().min(1),
  userId: z.string().min(1),
  rideRequestId: z.string().min(1),
  status: z.string().trim().min(1).max(50),
});

export const updateMembershipSchema = z.object({
  status: z.string().trim().min(1).max(50).optional(),
});

export const membershipIdSchema = z.object({
  id: z.string().min(1),
});
