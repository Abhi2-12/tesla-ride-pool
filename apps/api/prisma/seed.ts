import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting deterministic development seed...");

  const alice = await prisma.user.upsert({
    where: {
      email: "alice.seed@example.test",
    },
    update: {
      name: "Alice Seed",
      role: "RIDER",
    },
    create: {
      name: "Alice Seed",
      email: "alice.seed@example.test",
      role: "RIDER",
    },
  });

  const bob = await prisma.user.upsert({
    where: {
      email: "bob.seed@example.test",
    },
    update: {
      name: "Bob Seed",
      role: "DRIVER",
    },
    create: {
      name: "Bob Seed",
      email: "bob.seed@example.test",
      role: "DRIVER",
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: {
      id: "seed_vehicle_001",
    },
    update: {
      ownerId: bob.id,
      type: "TESLA_MODEL_3",
      capacity: 4,
    },
    create: {
      id: "seed_vehicle_001",
      ownerId: bob.id,
      type: "TESLA_MODEL_3",
      capacity: 4,
    },
  });

  const pool = await prisma.pool.upsert({
    where: {
      id: "seed_pool_001",
    },
    update: {
      vehicleId: vehicle.id,
      creatorId: bob.id,
      capacity: 4,
      state: "OPEN",
    },
    create: {
      id: "seed_pool_001",
      vehicleId: vehicle.id,
      creatorId: bob.id,
      capacity: 4,
      state: "OPEN",
    },
  });

  const rideRequest = await prisma.rideRequest.upsert({
    where: {
      id: "seed_ride_request_001",
    },
    update: {
      userId: alice.id,
      origin: "Dhaka University",
      destination: "Gulshan 2",
      status: "MATCHED",
    },
    create: {
      id: "seed_ride_request_001",
      userId: alice.id,
      origin: "Dhaka University",
      destination: "Gulshan 2",
      status: "MATCHED",
    },
  });

  await prisma.poolMembership.upsert({
    where: {
      id: "seed_membership_001",
    },
    update: {
      poolId: pool.id,
      userId: alice.id,
      rideRequestId: rideRequest.id,
      status: "ACTIVE",
    },
    create: {
      id: "seed_membership_001",
      poolId: pool.id,
      userId: alice.id,
      rideRequestId: rideRequest.id,
      status: "ACTIVE",
    },
  });

  await prisma.rideHistory.upsert({
    where: {
      id: "seed_history_001",
    },
    update: {
      poolId: pool.id,
      oldState: "CREATED",
      newState: "OPEN",
      changedBy: bob.id,
    },
    create: {
      id: "seed_history_001",
      poolId: pool.id,
      oldState: "CREATED",
      newState: "OPEN",
      changedBy: bob.id,
    },
  });

  await prisma.fare.upsert({
    where: {
      id: "seed_fare_001",
    },
    update: {
      poolId: pool.id,
      userId: alice.id,
      amount: 250,
      calculationData: {
        baseFare: 200,
        sharedRideAdjustment: 50,
        currency: "BDT",
      },
    },
    create: {
      id: "seed_fare_001",
      poolId: pool.id,
      userId: alice.id,
      amount: 250,
      calculationData: {
        baseFare: 200,
        sharedRideAdjustment: 50,
        currency: "BDT",
      },
    },
  });

  console.log("Seed completed successfully.");

  console.log({
    rider: alice.id,
    driver: bob.id,
    vehicle: vehicle.id,
    pool: pool.id,
    rideRequest: rideRequest.id,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });