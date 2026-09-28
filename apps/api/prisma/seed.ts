import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

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
  console.log("Starting Dhaka Tesla Pool seed with story cast...");

  // 1. Driver & Tesla Vehicle
  const jashim = await prisma.user.upsert({
    where: { email: "jashim@teslapool.bd" },
    update: { name: "Jashim", role: "DRIVER" },
    create: {
      id: "user_jashim_driver",
      name: "Jashim",
      email: "jashim@teslapool.bd",
      role: "DRIVER",
    },
  });

  const bullet = await prisma.vehicle.upsert({
    where: { id: "vehicle_bullet_001" },
    update: {
      ownerId: jashim.id,
      type: "TESLA_3_WHEELER",
      capacity: 3,
    },
    create: {
      id: "vehicle_bullet_001",
      ownerId: jashim.id,
      type: "TESLA_3_WHEELER",
      capacity: 3,
    },
  });

  // 2. Passengers (Nusrat, Rafiq, Shirin)
  const nusrat = await prisma.user.upsert({
    where: { email: "nusrat@teslapool.bd" },
    update: { name: "Nusrat", role: "RIDER" },
    create: {
      id: "user_nusrat_rider",
      name: "Nusrat",
      email: "nusrat@teslapool.bd",
      role: "RIDER",
    },
  });

  const rafiq = await prisma.user.upsert({
    where: { email: "rafiq@teslapool.bd" },
    update: { name: "Rafiq", role: "RIDER" },
    create: {
      id: "user_rafiq_rider",
      name: "Rafiq",
      email: "rafiq@teslapool.bd",
      role: "RIDER",
    },
  });

  const shirin = await prisma.user.upsert({
    where: { email: "shirin@teslapool.bd" },
    update: { name: "Shirin", role: "RIDER" },
    create: {
      id: "user_shirin_rider",
      name: "Shirin",
      email: "shirin@teslapool.bd",
      role: "RIDER",
    },
  });

  // 3. Ride Requests
  const reqNusrat = await prisma.rideRequest.upsert({
    where: { id: "req_nusrat_001" },
    update: {
      userId: nusrat.id,
      origin: "Banani Road 11",
      destination: "Mohakhali",
      status: "MATCHED",
    },
    create: {
      id: "req_nusrat_001",
      userId: nusrat.id,
      origin: "Banani Road 11",
      destination: "Mohakhali",
      status: "MATCHED",
    },
  });

  const reqRafiq = await prisma.rideRequest.upsert({
    where: { id: "req_rafiq_001" },
    update: {
      userId: rafiq.id,
      origin: "Banani Road 11",
      destination: "Gulshan 1",
      status: "MATCHED",
    },
    create: {
      id: "req_rafiq_001",
      userId: rafiq.id,
      origin: "Banani Road 11",
      destination: "Gulshan 1",
      status: "MATCHED",
    },
  });

  const reqShirin = await prisma.rideRequest.upsert({
    where: { id: "req_shirin_001" },
    update: {
      userId: shirin.id,
      origin: "Banani Road 11",
      destination: "Farmgate",
      status: "REQUESTED",
    },
    create: {
      id: "req_shirin_001",
      userId: shirin.id,
      origin: "Banani Road 11",
      destination: "Farmgate",
      status: "REQUESTED",
    },
  });

  // 4. Shared Pool
  const bulletPool = await prisma.pool.upsert({
    where: { id: "pool_bullet_banani_001" },
    update: {
      vehicleId: bullet.id,
      creatorId: jashim.id,
      capacity: 3,
      state: "MATCHED",
    },
    create: {
      id: "pool_bullet_banani_001",
      vehicleId: bullet.id,
      creatorId: jashim.id,
      capacity: 3,
      state: "MATCHED",
    },
  });

  // 5. Memberships
  await prisma.poolMembership.upsert({
    where: { id: "membership_nusrat_001" },
    update: {
      poolId: bulletPool.id,
      userId: nusrat.id,
      rideRequestId: reqNusrat.id,
      status: "ACTIVE",
    },
    create: {
      id: "membership_nusrat_001",
      poolId: bulletPool.id,
      userId: nusrat.id,
      rideRequestId: reqNusrat.id,
      status: "ACTIVE",
    },
  });

  await prisma.poolMembership.upsert({
    where: { id: "membership_rafiq_001" },
    update: {
      poolId: bulletPool.id,
      userId: rafiq.id,
      rideRequestId: reqRafiq.id,
      status: "ACTIVE",
    },
    create: {
      id: "membership_rafiq_001",
      poolId: bulletPool.id,
      userId: rafiq.id,
      rideRequestId: reqRafiq.id,
      status: "ACTIVE",
    },
  });

  // 6. Ride History
  await prisma.rideHistory.upsert({
    where: { id: "history_bullet_001" },
    update: {
      poolId: bulletPool.id,
      oldState: "REQUESTED",
      newState: "MATCHED",
      changedBy: jashim.id,
    },
    create: {
      id: "history_bullet_001",
      poolId: bulletPool.id,
      oldState: "REQUESTED",
      newState: "MATCHED",
      changedBy: jashim.id,
    },
  });

  // 7. Fares (in Paisa / Poysha: 1 BDT = 100 Poysha. Nusrat: 120 BDT = 12000 Poysha; Rafiq: 100 BDT = 10000 Poysha)
  await prisma.fare.upsert({
    where: { id: "fare_nusrat_001" },
    update: {
      poolId: bulletPool.id,
      userId: nusrat.id,
      amount: 120.0,
      calculationData: {
        baseFarePoysha: 8000,
        distanceChargePoysha: 6000,
        poolDiscountPoysha: 2000,
        totalPoysha: 12000,
        totalBDT: 120,
        currency: "BDT",
      },
    },
    create: {
      id: "fare_nusrat_001",
      poolId: bulletPool.id,
      userId: nusrat.id,
      amount: 120.0,
      calculationData: {
        baseFarePoysha: 8000,
        distanceChargePoysha: 6000,
        poolDiscountPoysha: 2000,
        totalPoysha: 12000,
        totalBDT: 120,
        currency: "BDT",
      },
    },
  });

  await prisma.fare.upsert({
    where: { id: "fare_rafiq_001" },
    update: {
      poolId: bulletPool.id,
      userId: rafiq.id,
      amount: 100.0,
      calculationData: {
        baseFarePoysha: 8000,
        distanceChargePoysha: 4000,
        poolDiscountPoysha: 2000,
        totalPoysha: 10000,
        totalBDT: 100,
        currency: "BDT",
      },
    },
    create: {
      id: "fare_rafiq_001",
      poolId: bulletPool.id,
      userId: rafiq.id,
      amount: 100.0,
      calculationData: {
        baseFarePoysha: 8000,
        distanceChargePoysha: 4000,
        poolDiscountPoysha: 2000,
        totalPoysha: 10000,
        totalBDT: 100,
        currency: "BDT",
      },
    },
  });

  console.log("Dhaka Tesla Pool seed completed successfully with story cast!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });