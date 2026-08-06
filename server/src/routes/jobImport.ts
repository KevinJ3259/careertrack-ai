import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

export const jobImportRouter = Router();

jobImportRouter.use(requireAuth);

const jobImportSchema = z.object({
  jobUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  postingText: z.string().trim().min(100).max(50000)
});

jobImportRouter.post("/parse", async (req, res) => {
  if (!env.OPENAI_API_KEY) {
    res.status(503).json({
      message: "The server does not have an OpenAI API key configured."
    });
    return;
  }

  const data = jobImportSchema.parse(req.body);
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    instructions: `
You extract structured job-posting information.

Use only the supplied posting text and optional URL.
Do not invent company names, salary, location, qualifications, benefits,
employment type, or responsibilities.

Return valid JSON using exactly this structure:

{
  "company": "",
  "role": "",
  "location": "",
  "salary": "",
  "jobUrl": "",
  "jobDescription": "",
  "notes": ""
}

Rules:
- Preserve the full useful job description in jobDescription.
- If a field is not present, return an empty string.
- Put useful extracted skills, requirements, or employment type in notes.
- Return only valid JSON.
`,
    input: `
JOB URL:
${data.jobUrl || "No URL supplied."}

JOB POSTING TEXT:
${data.postingText}
`
  });

  try {
    const parsedJob = JSON.parse(response.output_text);

    res.json({
      company: typeof parsedJob.company === "string" ? parsedJob.company : "",
      role: typeof parsedJob.role === "string" ? parsedJob.role : "",
      location: typeof parsedJob.location === "string" ? parsedJob.location : "",
      salary: typeof parsedJob.salary === "string" ? parsedJob.salary : "",
      jobUrl:
        typeof parsedJob.jobUrl === "string" && parsedJob.jobUrl
          ? parsedJob.jobUrl
          : data.jobUrl || "",
      jobDescription:
        typeof parsedJob.jobDescription === "string"
          ? parsedJob.jobDescription
          : data.postingText,
      notes: typeof parsedJob.notes === "string" ? parsedJob.notes : ""
    });
  } catch {
    res.status(502).json({
      message: "The AI job-import response could not be processed. Please try again."
    });
  }
});