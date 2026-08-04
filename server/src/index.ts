import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { applicationsRouter } from "./routes/applications.js";
import { aiRouter } from "./routes/ai.js";
import { errorHandler } from "./middleware/error.js";
import { interviewsRouter } from "./routes/interviews.js";

const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/ai", aiRouter);
app.use(errorHandler);
app.use("/api/interviews", interviewsRouter);

const server = app.listen(env.PORT, () => {
  console.log(`API running at http://localhost:${env.PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
