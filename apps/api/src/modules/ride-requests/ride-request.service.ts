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
  const request = await prisma.rideRequest.findUnique({
    where: { id },
    include: {
      user: true,
      poolMemberships: true,
    },
  });

  if (!request) {
    throw new AppError(
      "Ride request not found",
      404,
      "RIDE_REQUEST_NOT_FOUND",
    );
  }

  return request;
}

export async function createRideRequest(
  input: CreateRideRequestInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  if (!user) {
    throw new AppError(
      "Ride request user not found",
      404,
      "USER_NOT_FOUND",
    );
  }

  return prisma.rideRequest.create({
    data: input,
  });
}

export async function updateRideRequest(
  id: string,
  input: UpdateRideRequestInput,
) {
  await getRideRequestById(id);

  return prisma.rideRequest.update({
    where: { id },
    data: input,
  });
}

export async function deleteRideRequest(id: string) {
  await getRideRequestById(id);

  try {
    await prisma.rideRequest.delete({
      where: { id },
    });
  } catch {
    throw new AppError(
      "Ride request cannot be deleted because related records exist",
      409,
      "RIDE_REQUEST_DELETE_CONFLICT",
    );
  }
}
