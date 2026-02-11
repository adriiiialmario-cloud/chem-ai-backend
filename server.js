import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// ✅ QUESTION GENERATOR
app.post("/generate-question", async (req, res) => {
  try {
    const { concept, difficulty } = req.body;

    const prompt = `
Create ONE conceptual or situational chemistry question.

Rules:
- Use ONLY this concept: ${concept}
- Difficulty: ${difficulty}
- No calculations.
- No multiple choice.
- Keep it clear and student-friendly.
Return only the question text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // cheap + very capable
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const question = completion.choices[0].message.content;

    res.json({ question });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating question");
  }
});


// ✅ ANSWER GRADER
app.post("/grade-answer", async (req, res) => {
  try {
    const { question, concept, studentAnswer } = req.body;

    const prompt = `
You are grading a student's chemistry answer.

Concept: ${concept}
Question: ${question}
Student Answer: ${studentAnswer}

Grade using this rubric:

1 = Bad (incorrect)
3 = Basic (partially correct)
5 = Good (correct but simple)
7 = Great (clear reasoning)
9 = Expert (deep scientific explanation)

Return STRICT JSON:

{
"rating": number,
"category": "Bad | Basic | Good | Great | Expert",
"feedback": "one sentence"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // lower = more consistent grading
    });

    const responseText = completion.choices[0].message.content;

    res.send(responseText);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error grading answer");
  }
});



app.listen(3000, () => {
  console.log("AI server running on port 3000");
});
