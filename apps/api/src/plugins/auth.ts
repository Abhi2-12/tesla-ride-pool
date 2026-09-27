import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

export async function authPlugin(
  app: FastifyInstance,
): Promise<void> {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const url = new URL(
        request.url,
        `http://${request.headers.host ?? "localhost"}`,
      );

      const headers = fromNodeHeaders(request.headers);

      const body =
        request.method === "GET" || request.body === undefined
          ? undefined
          : JSON.stringify(request.body);

      const requestInit: RequestInit = {
        method: request.method,
        headers,
      };

      if (body !== undefined) {
        requestInit.body = body;
      }

      const response = await auth.handler(
        new Request(url, requestInit),
      );

      reply.status(response.status);

      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      const text = await response.text();

      if (!text) {
        return reply.send();
      }

      return reply.send(text);
    },
  });
}