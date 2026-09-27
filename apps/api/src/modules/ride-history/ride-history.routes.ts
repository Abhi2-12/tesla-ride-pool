import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createRideHistorySchema,
  poolHistoryParamsSchema,
} from "./ride-history.schema.js";
import {
  createRideHistory,
  getRideHistoryByPool,
  listRideHistory,
} from "./ride-history.service.js";

export async function rideHistoryRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/ride-history", async () => {
    return listRideHistory();
  });

  app.get("/pools/:poolId/history", async (request) => {
    const { poolId } = validate(
      poolHistoryParamsSchema,
      request.params,
    );

    return getRideHistoryByPool(poolId);
  });

  app.post("/ride-history", async (request, reply) => {
    const input = validate(
      createRideHistorySchema,
      request.body,
    );

    const history = await createRideHistory(input);

    return reply.status(201).send(history);
  });
}
