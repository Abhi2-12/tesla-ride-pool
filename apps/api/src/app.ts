import { env } from "./config/env.js";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { healthRoutes } from "./routes/health.js";

export function createApp() {
  void env;

  const app = Fastify({
    logger: true,
  });

  app.register(helmet);

  app.register(cors, {
    origin: false,
  });

  app.register(healthRoutes);

  return app;
}