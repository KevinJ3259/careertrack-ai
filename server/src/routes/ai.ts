import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

const coverLetterSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  jobDescription: z.string().trim().min(40).max(20000),
  candidateBackground: z.string().trim().min(40).max(10000)
});

aiRouter.post("/cover-letter", async (req, res) => {
  if (!env.OPENAI_API_KEY) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = coverLetterSchema.parse(req.body);
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    instructions:
      "Write a truthful and concise cover-letter draft. Never invent experience, credentials, employers, accomplishments, metrics, or technical skills. Return only the letter body.",
    input: `
Company: ${data.company}
Role: ${data.role}

Job description:
${data.jobDescription}

Candidate background:
${data.candidateBackground}

Write a tailored cover letter of approximately 250 to 350 words.
Use a professional and confident tone.
Connect only the supplied background to the job requirements.
`
  });

  res.json({ draft: response.output_text });
});

const resumeAnalysisSchema = z.object({
  resumeText: z.string().trim().min(100).max(30000),
  jobDescription: z.string().trim().min(100).max(20000)
});

aiRouter.post("/resume-analysis", async (req, res) => {
  if (!env.OPENAI_API_KEY) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = resumeAnalysisSchema.parse(req.body);
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    instructions: `
You are a careful resume reviewer.

Analyze only the resume and job description supplied by the user.
Do not invent skills, employment history, education, certifications, or accomplishments.

Return valid JSON using exactly this structure:

{
  "matchScore": 0,
  "summary": "",
  "strengths": [""],
  "missingKeywords": [""],
  "improvements": [""],
  "revisedProfessionalSummary": ""
}

The matchScore must be an integer from 0 through 100.
Keep each list concise and actionable.
`,
    input: `
RESUME:
${data.resumeText}

JOB DESCRIPTION:
${data.jobDescription}
`
  });

  try {
    const analysis = JSON.parse(response.output_text);
    res.json(analysis);
  } catch {
    res.status(502).json({
      message: "The AI response could not be processed. Please try again."
    });
  }
});