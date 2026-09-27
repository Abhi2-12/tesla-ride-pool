import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type {
  CreateRideRequestInput,
  UpdateRideRequestInput,
} from "./ride-request.types.js";

export async function listRideRequests() {
  return prisma.rideRequest.findMany({
    include: {
      user: true,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });
}

export async function getRideRequestById(id: string) {
  const rideRequest = await prisma.rideRequest.findUnique({
    where: { id },
    include: {
      user: true,
      poolMemberships: true,
    },
  });

  if (!rideRequest) {
    throw new AppError(
      "Ride request not found",
      404,
      "RIDE_REQUEST_NOT_FOUND",
    );
  }

  return rideRequest;
}

export async function createRideRequest(
  input: CreateRideRequestInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return prisma.rideRequest.create({
    data: {
      userId: input.userId,
      origin: input.origin,
      destination: input.destination,
      status: input.status,
    },
    include: {
      user: true,
    },
  });
}

export async function updateRideRequest(
  id: string,
  input: UpdateRideRequestInput,
) {
  const existing = await prisma.rideRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      "Ride request not found",
      404,
      "RIDE_REQUEST_NOT_FOUND",
    );
  }

  const data = {
    ...(input.origin !== undefined
      ? { origin: input.origin }
      : {}),
    ...(input.destination !== undefined
      ? { destination: input.destination }
      : {}),
    ...(input.status !== undefined
      ? { status: input.status }
      : {}),
  };

  return prisma.rideRequest.update({
    where: { id },
    data,
    include: {
      user: true,
    },
  });
}

export async function deleteRideRequest(id: string) {
  const existing = await prisma.rideRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      "Ride request not found",
      404,
      "RIDE_REQUEST_NOT_FOUND",
    );
  }

  try {
    await prisma.rideRequest.delete({
      where: { id },
    });
  } catch {
    throw new AppError(
      "Ride request cannot be deleted because related records exist",
      409,
      "RIDE_REQUEST_HAS_RELATIONS",
    );
  }
}