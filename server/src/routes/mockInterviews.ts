import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const mockInterviewsRouter = Router();

mockInterviewsRouter.use(requireAuth);

const createMockInterviewResultSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  question: z.string().trim().min(10).max(5000),
  answer: z.string().trim().min(20).max(15000),
  overallScore: z.number().int().min(0).max(100),
  relevanceScore: z.number().int().min(0).max(100),
  clarityScore: z.number().int().min(0).max(100),
  structureScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string().trim().min(1).max(1000)).max(20),
  improvements: z.array(z.string().trim().min(1).max(1000)).max(20),
  improvedAnswer: z.string().trim().min(1).max(15000),
  followUpQuestion: z.string().trim().min(1).max(5000)
});

mockInterviewsRouter.get("/", async (req, res) => {
  const results = await prisma.mockInterviewResult.findMany({
    where: {
      userId: req.userId!
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(results);
});

mockInterviewsRouter.post("/", async (req, res) => {
  const data = createMockInterviewResultSchema.parse(req.body);

  const result = await prisma.mockInterviewResult.create({
    data: {
      company: data.company,
      role: data.role,
      question: data.question,
      answer: data.answer,
      overallScore: data.overallScore,
      relevanceScore: data.relevanceScore,
      clarityScore: data.clarityScore,
      structureScore: data.structureScore,
      strengths: data.strengths,
      improvements: data.improvements,
      improvedAnswer: data.improvedAnswer,
      followUpQuestion: data.followUpQuestion,
      userId: req.userId!
    }
  });

  res.status(201).json(result);
});

mockInterviewsRouter.delete("/:id", async (req, res) => {
  const id = z.string().cuid().parse(req.params.id);

  const result = await prisma.mockInterviewResult.deleteMany({
    where: {
      id,
      userId: req.userId!
    }
  });

  if (!result.count) {
    res.status(404).json({
      message: "Mock interview result not found."
    });
    return;
  }

  res.status(204).send();
});