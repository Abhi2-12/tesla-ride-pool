import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createFareSchema,
  fareIdSchema,
  updateFareSchema,
} from "./fare.schema.js";
import {
  createFare,
  deleteFare,
  getFareById,
  listFares,
  updateFare,
} from "./fare.service.js";

export async function fareRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/fares", async () => {
    return listFares();
  });

  app.get("/fares/:id", async (request) => {
    const { id } = validate(fareIdSchema, request.params);

    return getFareById(id);
  });

  app.post("/fares", async (request, reply) => {
    const input = validate(createFareSchema, request.body);
    const fare = await createFare(input);

    return reply.status(201).send(fare);
  });

  app.patch("/fares/:id", async (request) => {
    const { id } = validate(fareIdSchema, request.params);
    const input = validate(updateFareSchema, request.body);

    return updateFare(id, input);
  });

  app.delete("/fares/:id", async (request, reply) => {
    const { id } = validate(fareIdSchema, request.params);

    await deleteFare(id);

    return reply.status(204).send();
  });
}