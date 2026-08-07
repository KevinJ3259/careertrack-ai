import { Router } from "express";
import OpenAI from "openai";
import { env } from "../env.js";

export const aiResumeOptimizerRouter = Router();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

aiResumeOptimizerRouter.post("/", async (req, res) => {
  const {
    resumeText,
    jobDescription
  } = req.body;

  const prompt = `
You are an expert ATS resume writer.

Resume:

${resumeText}

Job Description:

${jobDescription}

Return ONLY JSON.

{
  "overallMatch": number,
  "missingKeywords": [],
  "improvements": [],
  "optimizedSummary": "",
  "optimizedExperience": [],
  "optimizedSkills": []
}
`;

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: {
      type: "json_object"
    },
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

 const content = completion.choices[0]?.message.content;

if (!content) {
  res.status(502).json({
    message: "The AI resume optimizer returned an empty response."
  });
  return;
}

res.json(JSON.parse(content));
});