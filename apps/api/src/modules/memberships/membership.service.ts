import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type {
  CreateMembershipInput,
  UpdateMembershipInput,
} from "./membership.types.js";

export async function listMemberships() {
  return prisma.poolMembership.findMany({
    include: {
      pool: true,
      user: true,
      rideRequest: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });
}

export async function getMembershipById(id: string) {
  const membership = await prisma.poolMembership.findUnique({
    where: { id },
    include: {
      pool: true,
      user: true,
      rideRequest: true,
    },
  });

  if (!membership) {
    throw new AppError(
      "Membership not found",
      404,
      "MEMBERSHIP_NOT_FOUND",
    );
  }

  return membership;
}

export async function createMembership(
  input: CreateMembershipInput,
) {
  const [pool, user, rideRequest] = await Promise.all([
    prisma.pool.findUnique({
      where: { id: input.poolId },
      include: {
        memberships: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: input.userId },
    }),
    prisma.rideRequest.findUnique({
      where: { id: input.rideRequestId },
    }),
  ]);

  if (!pool) {
    throw new AppError("Pool not found", 404, "POOL_NOT_FOUND");
  }

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!rideRequest) {
    throw new AppError(
      "Ride request not found",
      404,
      "RIDE_REQUEST_NOT_FOUND",
    );
  }

  if (pool.memberships.length >= pool.capacity) {
    throw new AppError(
      "Pool has reached its capacity",
      409,
      "POOL_FULL",
    );
  }

  const existing = await prisma.poolMembership.findFirst({
    where: {
      poolId: input.poolId,
      userId: input.userId,
    },
  });

  if (existing) {
    throw new AppError(
      "User is already a member of this pool",
      409,
      "MEMBERSHIP_EXISTS",
    );
  }

  return prisma.poolMembership.create({
    data: {
      poolId: input.poolId,
      userId: input.userId,
      rideRequestId: input.rideRequestId,
      status: input.status,
    },
    include: {
      pool: true,
      user: true,
      rideRequest: true,
    },
  });
}

export async function updateMembership(
  id: string,
  input: UpdateMembershipInput,
) {
  const existing = await prisma.poolMembership.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      "Membership not found",
      404,
      "MEMBERSHIP_NOT_FOUND",
    );
  }

  const data = {
    ...(input.status !== undefined
      ? { status: input.status }
      : {}),
  };

  return prisma.poolMembership.update({
    where: { id },
    data,
    include: {
      pool: true,
      user: true,
      rideRequest: true,
    },
  });
}

export async function deleteMembership(id: string) {
  const existing = await prisma.poolMembership.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      "Membership not found",
      404,
      "MEMBERSHIP_NOT_FOUND",
    );
  }

  await prisma.poolMembership.delete({
    where: { id },
  });
}