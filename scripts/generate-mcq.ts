import { OpenAI } from "openai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey) {
  console.error("NVIDIA_API_KEY environment variable is not set.");
  process.exit(1);
}

// We can try to use a different model or fallback to OpenAI if they provided an OpenAI key in the future.
// For now, continuing with NVIDIA API as previously configured, but we can lower max_tokens or use a faster model if available.
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const SYSTEM_PROMPT = `
You are a technical question generator for a competitive exam / interview-prep platform. You must generate exactly 20 unique, high-quality multiple-choice questions for the given subject and subtopic, ready to be rendered directly in a web application.

INPUT PARAMETERS:
- Subject: {{subject}}
- Subtopic: {{subtopic}}
- Difficulty Range: {{difficulty_range}}  (e.g., "Beginner to Advanced" or "Intermediate to Advanced")
- Reference Context: {{retrieved_context}}

DIFFICULTY DISTRIBUTION (out of 20):
- If difficulty_range includes Beginner: 6 Beginner, 8 Intermediate, 6 Advanced
- If difficulty_range is "Intermediate to Advanced" only: 10 Intermediate, 10 Advanced

RULES:
1. Every question must be technically accurate and grounded in the provided reference context. Do not invent facts not supported by the context or well-established knowledge of {{subject}}.
2. No duplicate questions, and no two questions testing the exact same concept in the same way.
3. Each question must have exactly 4 options, with exactly 1 correct answer.
4. The 3 incorrect options must be plausible distractors reflecting common misconceptions — not obviously wrong filler.
5. Every question must include a 2–3 line explanation stating why the correct answer is correct.
6. Prioritize concepts that are commonly asked in real technical interviews for {{subject}} — {{subtopic}}, not obscure edge cases.
7. Do not repeat question phrasing patterns — vary sentence structure across the 20 questions.
8. Output must be valid JSON only. No preamble, no markdown, no explanation outside the JSON structure.

OUTPUT FORMAT (strict JSON array, exactly 20 objects):

[
  {
    "id": "{{subject}}-{{subtopic}}-001",
    "subject": "{{subject}}",
    "subtopic": "{{subtopic}}",
    "difficulty": "Beginner | Intermediate | Advanced",
    "questionText": "string",
    "questionType": "MCQ",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string (must exactly match one of the options)",
    "explanation": "string",
    "tags": ["string", "string"],
    "createdBy": "AI-generated",
    "reviewed": false
  }
]

Generate the full array of 20 questions now.
`;

async function runMCQGeneration(subject: string, subtopic: string) {
  console.log(`Starting MCQ Generation for ${subject} -> ${subtopic}...`);

  // We don't have a RAG pipeline yet, so we leave retrieved_context empty or give basic context.
  let prompt = SYSTEM_PROMPT
    .replace(/{{subject}}/g, subject)
    .replace(/{{subtopic}}/g, subtopic)
    .replace(/{{difficulty_range}}/g, "Beginner to Advanced")
    .replace(/{{retrieved_context}}/g, "RAG pipeline not yet active. Rely on highly established internal knowledge of this subtopic.");

  try {
    const response = await openai.chat.completions.create({
      model: "meta/llama-3.2-90b-vision-instruct",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Received empty response");
    
    let jsonContent = content;
    if (jsonContent.startsWith("\`\`\`json")) jsonContent = jsonContent.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
    if (jsonContent.startsWith("\`\`\`")) jsonContent = jsonContent.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");

    // Parse to ensure valid JSON
    const questions = JSON.parse(jsonContent);

    const outputDir = path.join(process.cwd(), "content", "mcq-generated");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const safeSlug = subtopic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filePath = path.join(outputDir, `${subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${safeSlug}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
    console.log(`✅ Generated ${questions.length} MCQs and saved to ${filePath}`);

  } catch (error) {
    console.error("Failed to generate MCQs:", error);
  }
}

// Default run for Spring Boot -> Auto-Configuration
runMCQGeneration("Spring Boot", "Auto-Configuration").catch(console.error);
