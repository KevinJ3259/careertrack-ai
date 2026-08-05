import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

const coverLetterSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  jobDescription: z.string().trim().min(40).max(20000),
  candidateBackground: z.string().trim().min(40).max(10000)
});

aiRouter.post("/cover-letter", async (req, res) => {
  const client = getOpenAIClient();

  if (!client) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = coverLetterSchema.parse(req.body);

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
  const client = getOpenAIClient();

  if (!client) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = resumeAnalysisSchema.parse(req.body);

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

const interviewCoachSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  jobDescription: z.string().trim().min(100).max(20000),
  resumeText: z.string().trim().min(100).max(30000).optional()
});

aiRouter.post("/interview-coach", async (req, res) => {
  const client = getOpenAIClient();

  if (!client) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = interviewCoachSchema.parse(req.body);

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    instructions: `
You are a careful interview coach.

Use only the supplied company, role, job description, and optional resume text.
Do not invent facts about the company, candidate, job, experience, education,
credentials, accomplishments, or technologies.

Return valid JSON using exactly this structure:

{
  "jobSummary": "",
  "keySkills": [""],
  "behavioralQuestions": [
    {
      "question": "",
      "whyItMatters": "",
      "starGuidance": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    }
  ],
  "technicalQuestions": [
    {
      "question": "",
      "answerGuidance": ""
    }
  ],
  "studyTopics": [""],
  "questionsToAsk": [""],
  "preparationChecklist": [""]
}

Requirements:
- jobSummary: 2 to 4 concise sentences.
- keySkills: 5 to 10 items.
- behavioralQuestions: 5 items.
- technicalQuestions: 5 role-specific items. For nontechnical roles, use role-specific scenario questions.
- studyTopics: 5 to 10 items.
- questionsToAsk: 5 thoughtful questions.
- preparationChecklist: 6 to 10 practical steps.
- Keep all guidance concise, truthful, and actionable.
- When resume text is supplied, tailor guidance only to experience explicitly present in it.
`,
    input: `
COMPANY:
${data.company}

ROLE:
${data.role}

JOB DESCRIPTION:
${data.jobDescription}

CANDIDATE RESUME:
${data.resumeText ?? "No resume text was supplied."}
`
  });

  try {
    const interviewPlan = JSON.parse(response.output_text);
    res.json(interviewPlan);
  } catch {
    res.status(502).json({
      message:
        "The AI interview-coach response could not be processed. Please try again."
    });
  }
});

const mockInterviewFeedbackSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  question: z.string().trim().min(10).max(5000),
  answer: z.string().trim().min(20).max(15000),
  jobDescription: z.string().trim().min(100).max(20000)
});

aiRouter.post("/mock-interview-feedback", async (req, res) => {
  const client = getOpenAIClient();

  if (!client) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = mockInterviewFeedbackSchema.parse(req.body);

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    instructions: `
You are a careful interview coach.

Evaluate only the interview question, candidate answer, role, company,
and job description supplied by the user.

Do not invent experience, credentials, accomplishments, or facts.

Return valid JSON using exactly this structure:

{
  "overallScore": 0,
  "relevanceScore": 0,
  "clarityScore": 0,
  "structureScore": 0,
  "strengths": [""],
  "improvements": [""],
  "improvedAnswer": "",
  "followUpQuestion": ""
}

All scores must be integers from 0 through 100.
Keep the feedback constructive, concise, and actionable.
The improved answer must not invent candidate experience.
`,
    input: `
COMPANY:
${data.company}

ROLE:
${data.role}

JOB DESCRIPTION:
${data.jobDescription}

INTERVIEW QUESTION:
${data.question}

CANDIDATE ANSWER:
${data.answer}
`
  });

  try {
    const feedback = JSON.parse(response.output_text);
    res.json(feedback);
  } catch {
    res.status(502).json({
      message:
        "The AI mock-interview response could not be processed. Please try again."
    });
  }
});