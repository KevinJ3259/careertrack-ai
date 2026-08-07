import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { applicationsRouter } from "./routes/applications.js";
import { aiRouter } from "./routes/ai.js";
import { errorHandler } from "./middleware/error.js";
import { interviewsRouter } from "./routes/interviews.js";
import { resumesRouter } from "./routes/resumes.js";
import { mockInterviewsRouter } from "./routes/mockInterviews.js";
import { jobImportRouter } from "./routes/jobImport.js";
import { remindersRouter } from "./routes/reminders.js";
import { verifyEmailConnection } from "./services/email.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/interviews", interviewsRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/mock-interviews", mockInterviewsRouter);
app.use("/api/job-import", jobImportRouter);
app.use("/api/reminders", remindersRouter);

app.use(errorHandler);

const server = app.listen(env.PORT, async () => {
  console.log(`API running at http://localhost:${env.PORT}`);

  try {
    await verifyEmailConnection();
    console.log("Email server connection verified.");

    startReminderScheduler();
  } catch (error) {
    console.error("Email server connection failed:", error);
  }
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

