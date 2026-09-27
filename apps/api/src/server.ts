import { createApp } from "./app.js";

const app = createApp();

const start = async (): Promise<void> => {
  try {
    await app.listen({
      host: "127.0.0.1",
      port: 3000,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
