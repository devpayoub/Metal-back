import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`🚀 API listening on http://localhost:${env.port}`);
  console.log(`📘 Swagger docs at  http://localhost:${env.port}/api/docs`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
