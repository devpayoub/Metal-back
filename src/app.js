import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { swaggerSpec } from "../docs/swagger.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (env.corsOrigin.includes("*") || env.corsOrigin.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MIS Metal Construction API</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0a0a;
      color: #f0f0f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #111;
      border: 1px solid #1e1e1e;
      border-radius: 20px;
      padding: 56px 64px;
      text-align: center;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 0 60px rgba(0,200,100,0.08);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(0, 200, 100, 0.1);
      border: 1px solid rgba(0, 200, 100, 0.3);
      border-radius: 999px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 600;
      color: #00c864;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 32px;
    }
    .check {
      width: 18px;
      height: 18px;
      background: #00c864;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      animation: pulse 2s ease-in-out infinite;
    }
    .check::after {
      content: '';
      display: block;
      width: 5px;
      height: 9px;
      border: 2px solid #000;
      border-top: none;
      border-left: none;
      transform: rotate(45deg) translateY(-1px);
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,200,100,0.5); }
      50% { box-shadow: 0 0 0 8px rgba(0,200,100,0); }
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
      color: #fff;
    }
    p {
      font-size: 14px;
      color: #666;
      margin-bottom: 36px;
    }
    .links {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    a {
      display: inline-block;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    a.primary {
      background: #00c864;
      color: #000;
    }
    a.primary:hover { background: #00e070; transform: translateY(-1px); }
    a.secondary {
      background: #1a1a1a;
      color: #aaa;
      border: 1px solid #2a2a2a;
    }
    a.secondary:hover { border-color: #444; color: #fff; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="check"></span>
      API BACKEND LIVE
    </div>
    <h1>MIS Metal Construction</h1>
    <p>Backend API is running and ready to accept requests.</p>
    <div class="links">
      <a class="primary" href="/api/docs">Swagger Docs</a>
      <a class="secondary" href="/api/health">Health Check</a>
    </div>
  </div>
</body>
</html>`);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
