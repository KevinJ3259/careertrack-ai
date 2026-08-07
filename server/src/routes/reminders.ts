import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const remindersRouter = Router();

remindersRouter.use(requireAuth);

const reminderTypeSchema = z.enum([
  "APPLICATION_FOLLOW_UP",
  "INTERVIEW_REMINDER",
  "THANK_YOU_EMAIL",
  "STATUS_CHECK",
  "CUSTOM"
]);

const createReminderSchema = z.object({
  reminderType: reminderTypeSchema,
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  recipientEmail: z.string().trim().email().optional().or(z.literal("")),
  dueAt: z.string().datetime(),
  applicationId: z.string().cuid().optional().or(z.literal(""))
});

const updateReminderSchema = z.object({
  reminderType: reminderTypeSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  recipientEmail: z.string().trim().email().optional().or(z.literal("")),
  dueAt: z.string().datetime().optional(),
  applicationId: z.string().cuid().optional().or(z.literal("")),
  isSent: z.boolean().optional()
});

async function verifyApplicationOwnership(
  applicationId: string | undefined,
  userId: string
) {
  if (!applicationId) return;

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }
}

remindersRouter.get("/", async (req, res) => {
  const reminders = await prisma.reminder.findMany({
    where: {
      userId: req.userId!
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
    orderBy: [
      { isSent: "asc" },
      { dueAt: "asc" }
    ]
  });

  res.json(reminders);
});

remindersRouter.post("/", async (req, res) => {
  const data = createReminderSchema.parse(req.body);
  const applicationId = data.applicationId || undefined;

  try {
    await verifyApplicationOwnership(applicationId, req.userId!);
  } catch (err) {
    if (err instanceof Error && err.message === "APPLICATION_NOT_FOUND") {
      res.status(404).json({
        message: "Job application not found."
      });
      return;
    }

    throw err;
  }

  const reminder = await prisma.reminder.create({
    data: {
      reminderType: data.reminderType,
      title: data.title,
      message: data.message || null,
      recipientEmail: data.recipientEmail || null,
      dueAt: new Date(data.dueAt),
      applicationId: applicationId ?? null,
      userId: req.userId!
    },
    include: {
      application: {
        select: {
          id: true,
          company: true,
          role: true
        }
      }
    }
  });

  res.status(201).json(reminder);
});

remindersRouter.patch("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);
  const data = updateReminderSchema.parse(req.body);

  const existing = await prisma.reminder.findFirst({
    where: {
      id,
      userId: req.userId!
    }
  });

  if (!existing) {
    res.status(404).json({
      message: "Reminder not found."
    });
    return;
  }

  const applicationId =
    data.applicationId === undefined
      ? undefined
      : data.applicationId || null;

  try {
    await verifyApplicationOwnership(
      applicationId ?? undefined,
      req.userId!
    );
  } catch (err) {
    if (err instanceof Error && err.message === "APPLICATION_NOT_FOUND") {
      res.status(404).json({
        message: "Job application not found."
      });
      return;
    }

    throw err;
  }

  const reminder = await prisma.reminder.update({
    where: {
      id
    },
    data: {
      reminderType: data.reminderType,
      title: data.title,
      message:
        data.message === undefined ? undefined : data.message || null,
      recipientEmail:
        data.recipientEmail === undefined
          ? undefined
          : data.recipientEmail || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      applicationId,
      isSent: data.isSent,
      sentAt:
        data.isSent === true
          ? new Date()
          : data.isSent === false
            ? null
            : undefined
    },
    include: {
      application: {
        select: {
          id: true,
          company: true,
          role: true
        }
      }
    }
  });

  res.json(reminder);
});

remindersRouter.delete("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);

  const result = await prisma.reminder.deleteMany({
    where: {
      id,
      userId: req.userId!
    }
  });

  if (!result.count) {
    res.status(404).json({
      message: "Reminder not found."
    });
    return;
  }

  res.status(204).send();
});