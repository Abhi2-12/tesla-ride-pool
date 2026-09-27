import type { FastifyInstance } from "fastify";
import { userRoutes } from "../modules/users/user.routes.js";
import { vehicleRoutes } from "../modules/vehicles/vehicle.routes.js";
import { rideRequestRoutes } from "../modules/ride-requests/ride-request.routes.js";
import { poolRoutes } from "../modules/pools/pool.routes.js";
import { membershipRoutes } from "../modules/memberships/membership.routes.js";
import { rideHistoryRoutes } from "../modules/ride-history/ride-history.routes.js";
import { fareRoutes } from "../modules/fares/fare.routes.js";

export async function registerRoutes(
  app: FastifyInstance,
): Promise<void> {
  await app.register(userRoutes);
  await app.register(vehicleRoutes);
  await app.register(rideRequestRoutes);
  await app.register(poolRoutes);
  await app.register(membershipRoutes);
  await app.register(rideHistoryRoutes);
  await app.register(fareRoutes);
}