import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const resumesRouter = Router();

resumesRouter.use(requireAuth);

const createResumeSchema = z.object({
  title: z.string().trim().min(1).max(150),
  resumeText: z.string().trim().min(50).max(50000),
  isDefault: z.boolean().optional().default(false)
});

const updateResumeSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  resumeText: z.string().trim().min(50).max(50000).optional(),
  isDefault: z.boolean().optional()
});

resumesRouter.get("/", async (req, res) => {
  const resumes = await prisma.resumeVersion.findMany({
    where: {
      userId: req.userId!
    },
    orderBy: [
      { isDefault: "desc" },
      { updatedAt: "desc" }
    ]
  });

  res.json(resumes);
});

resumesRouter.post("/", async (req, res) => {
  const data = createResumeSchema.parse(req.body);

  const resume = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.resumeVersion.updateMany({
        where: {
          userId: req.userId!
        },
        data: {
          isDefault: false
        }
      });
    }

    return tx.resumeVersion.create({
      data: {
        title: data.title,
        resumeText: data.resumeText,
        isDefault: data.isDefault,
        userId: req.userId!
      }
    });
  });

  res.status(201).json(resume);
});

resumesRouter.patch("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);
  const data = updateResumeSchema.parse(req.body);

  const existing = await prisma.resumeVersion.findFirst({
    where: {
      id,
      userId: req.userId!
    }
  });

  if (!existing) {
    res.status(404).json({
      message: "Resume version not found."
    });
    return;
  }

  const resume = await prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.resumeVersion.updateMany({
        where: {
          userId: req.userId!,
          id: {
            not: id
          }
        },
        data: {
          isDefault: false
        }
      });
    }

    return tx.resumeVersion.update({
      where: { id },
      data
    });
  });

  res.json(resume);
});

resumesRouter.post("/:id/duplicate", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);

  const existing = await prisma.resumeVersion.findFirst({
    where: {
      id,
      userId: req.userId!
    }
  });

  if (!existing) {
    res.status(404).json({
      message: "Resume version not found."
    });
    return;
  }

  const duplicate = await prisma.resumeVersion.create({
    data: {
      title: `${existing.title} Copy`,
      resumeText: existing.resumeText,
      isDefault: false,
      userId: req.userId!
    }
  });

  res.status(201).json(duplicate);
});

resumesRouter.delete("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);

  const result = await prisma.resumeVersion.deleteMany({
    where: {
      id,
      userId: req.userId!
    }
  });

  if (!result.count) {
    res.status(404).json({
      message: "Resume version not found."
    });
    return;
  }

  res.status(204).send();
});