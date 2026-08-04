import { ApplicationStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

const applicationSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  jobUrl: z.string().url().or(z.literal("")).optional(),
  location: z.string().trim().max(120).optional(),
  salary: z.string().trim().max(80).optional(),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.SAVED),
  jobDescription: z.string().max(20000).optional(),
  notes: z.string().max(10000).optional(),
  appliedAt: z.string().datetime().nullable().optional()
});

applicationsRouter.get("/", async (req, res) => {
  const status = z.nativeEnum(ApplicationStatus).optional().parse(req.query.status);

  const applications = await prisma.jobApplication.findMany({
    where: {
      userId: req.userId!,
      ...(status ? { status } : {})
    },
    orderBy: { updatedAt: "desc" }
  });

  res.json(applications);
});

applicationsRouter.post("/", async (req, res) => {
  const data = applicationSchema.parse(req.body);

  const application = await prisma.jobApplication.create({
    data: {
      ...data,
      jobUrl: data.jobUrl || null,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
      userId: req.userId!
    }
  });

  res.status(201).json(application);
});

applicationsRouter.patch("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);
  const data = applicationSchema.partial().parse(req.body);

  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId: req.userId! }
  });

  if (!existing) {
    res.status(404).json({ message: "Application not found." });
    return;
  }

  const application = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...data,
      ...(data.jobUrl !== undefined ? { jobUrl: data.jobUrl || null } : {}),
      ...(data.appliedAt !== undefined
        ? { appliedAt: data.appliedAt ? new Date(data.appliedAt) : null }
        : {})
    }
  });

  res.json(application);
});

applicationsRouter.delete("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);

  const result = await prisma.jobApplication.deleteMany({
    where: { id, userId: req.userId! }
  });

  if (!result.count) {
    res.status(404).json({ message: "Application not found." });
    return;
  }

  res.status(204).send();
});
