import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const interviewsRouter = Router();

interviewsRouter.use(requireAuth);

const interviewSchema = z.object({
  applicationId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  interviewType: z.string().trim().min(1).max(80),
  interviewerName: z.string().trim().max(120).optional(),
  location: z.string().trim().max(200).optional(),
  meetingLink: z.string().url().or(z.literal("")).optional(),
  preparationNotes: z.string().max(10000).optional(),
  followUpNotes: z.string().max(10000).optional(),
  outcome: z.string().trim().max(120).optional()
});

interviewsRouter.get("/", async (req, res) => {
  const interviews = await prisma.interview.findMany({
    where: {
      application: {
        userId: req.userId!
      }
    },
    include: {
      application: {
        select: {
          id: true,
          company: true,
          role: true
        }
      }
    },
    orderBy: {
      scheduledAt: "asc"
    }
  });

  res.json(interviews);
});

interviewsRouter.post("/", async (req, res) => {
  const data = interviewSchema.parse(req.body);

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: data.applicationId,
      userId: req.userId!
    }
  });

  if (!application) {
    res.status(404).json({
      message: "Job application not found."
    });
    return;
  }

  const interview = await prisma.interview.create({
    data: {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      meetingLink: data.meetingLink || null
    }
  });

  res.status(201).json(interview);
});

interviewsRouter.patch("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);
  const data = interviewSchema.partial().parse(req.body);

  const existing = await prisma.interview.findFirst({
    where: {
      id,
      application: {
        userId: req.userId!
      }
    }
  });

  if (!existing) {
    res.status(404).json({
      message: "Interview not found."
    });
    return;
  }

  const interview = await prisma.interview.update({
    where: { id },
    data: {
      ...data,
      ...(data.scheduledAt
        ? { scheduledAt: new Date(data.scheduledAt) }
        : {}),
      ...(data.meetingLink !== undefined
        ? { meetingLink: data.meetingLink || null }
        : {})
    }
  });

  res.json(interview);
});

interviewsRouter.delete("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);

  const result = await prisma.interview.deleteMany({
    where: {
      id,
      application: {
        userId: req.userId!
      }
    }
  });

  if (!result.count) {
    res.status(404).json({
      message: "Interview not found."
    });
    return;
  }

  res.status(204).send();
});