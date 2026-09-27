import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createPoolSchema,
  poolIdSchema,
  updatePoolSchema,
} from "./pool.schema.js";
import {
  createPool,
  deletePool,
  getPoolById,
  listPools,
  updatePool,
} from "./pool.service.js";

export async function poolRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/pools", async () => {
    return listPools();
  });

  app.get("/pools/:id", async (request) => {
    const { id } = validate(poolIdSchema, request.params);

    return getPoolById(id);
  });

  app.post("/pools", async (request, reply) => {
    const input = validate(createPoolSchema, request.body);
    const pool = await createPool(input);

    return reply.status(201).send(pool);
  });

  app.patch("/pools/:id", async (request) => {
    const { id } = validate(poolIdSchema, request.params);
    const input = validate(updatePoolSchema, request.body);

    return updatePool(id, input);
  });

  app.delete("/pools/:id", async (request, reply) => {
    const { id } = validate(poolIdSchema, request.params);

    await deletePool(id);

    return reply.status(204).send();
  });
}