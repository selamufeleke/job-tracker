const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.use(authMiddleware);

router.post("/cover-letter", async (req, res) => {
  const { company, role, jobDescription, userBackground } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: "Company and role are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Write a professional, concise cover letter for a ${role} position at ${company}.
${jobDescription ? `Job description: ${jobDescription}` : ""}
${userBackground ? `Candidate background: ${userBackground}` : "The candidate is a recent computer science graduate."}

Strict rules:
- Do NOT include a header, address, date, or contact info block at the top.
- Do NOT use any placeholder brackets like [Your Name], [Date], [Address], etc. anywhere in the letter.
- Start directly with "Dear Hiring Manager," and end with "Sincerely," followed by the word "Selamu" as the sign-off name.
- Body should be 3-4 short paragraphs only.
- Output only the letter text, nothing else.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ coverLetter: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate cover letter" });
  }
});
router.post("/fit-score", async (req, res) => {
  const { company, role, jobDescription, userBackground } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: "Job description is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are evaluating how well a candidate fits a job posting.

Job: ${role} at ${company}
Job description: ${jobDescription}
Candidate background: ${userBackground || "Recent computer science graduate with a full-stack portfolio project using React, Node.js, PostgreSQL, and the Gemini API."}

Respond ONLY with valid JSON in exactly this format, no other text, no markdown code fences:
{
  "score": <number 0-100>,
  "strengths": ["short strength 1", "short strength 2", "short strength 3"],
  "gaps": ["short gap 1", "short gap 2"],
  "advice": "one short sentence of actionable advice for this specific application"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Gemini sometimes wraps JSON in markdown code fences - strip those if present
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not calculate fit score" });
  }
});
module.exports = router;
