import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createRideRequestSchema,
  updateRideRequestSchema,
  rideRequestIdSchema,
} from "./ride-request.schema.js";
import {
  createRideRequest,
  deleteRideRequest,
  getRideRequestById,
  listRideRequests,
  updateRideRequest,
} from "./ride-request.service.js";

export async function rideRequestRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/ride-requests", async () => {
    return listRideRequests();
  });

  app.get("/ride-requests/:id", async (request) => {
    const { id } = validate(
      rideRequestIdSchema,
      request.params,
    );

    return getRideRequestById(id);
  });

  app.post("/ride-requests", async (request, reply) => {
    const input = validate(
      createRideRequestSchema,
      request.body,
    );

    const rideRequest = await createRideRequest(input);

    return reply.status(201).send(rideRequest);
  });

  app.patch("/ride-requests/:id", async (request) => {
    const { id } = validate(
      rideRequestIdSchema,
      request.params,
    );

    const input = validate(
      updateRideRequestSchema,
      request.body,
    );

    return updateRideRequest(id, input);
  });

  app.delete("/ride-requests/:id", async (request, reply) => {
    const { id } = validate(
      rideRequestIdSchema,
      request.params,
    );

    await deleteRideRequest(id);

    return reply.status(204).send();
  });
}