import { OpenAI } from "openai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { getSubjectBySlug } from "../src/data/subjects-schema";

dotenv.config();

const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey) {
  console.error("NVIDIA_API_KEY environment variable is not set.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const SYSTEM_PROMPT = `
You are an expert software engineer and technical interviewer. Your task is to write highly structured, accurate, and concise answers to interview questions.
You must return the response strictly as a JSON object matching this schema:

{
  "quickAnswer": "One-line, quotable definition — the 'hook' a candidate says first.",
  "mentalModel": "Real-world analogy that makes it memorable and shows depth.",
  "whatItIs": "2–3 sentence technical explanation, precise not padded.",
  "whyItExists": "The pain point before this existed — shows 'why,' not just 'what'.",
  "codeDemo": {
    "language": "e.g., java, python, bash, config, etc.",
    "code": "Code snippet, CLI command, or config."
  },
  "tradeOffs": "When NOT to use this, or its performance costs.",
  "theyMightAskNext": [
    {
      "question": "A likely follow-up question the interviewer will ask",
      "answer": "A concise 1-2 sentence answer"
    },
    {
      "question": "Another follow-up",
      "answer": "Answer here"
    }
  ],
  "usedInProduction": "How this is actually used in real-world systems (e.g., 'At scale, this is used to...').",
  "relatedTopics": [
    "Topic 1",
    "Topic 2"
  ]
}

Ensure the output is ONLY valid JSON, with no markdown code block wrappers (like \`\`\`json) or extra text.
`;

async function identifyQuestions(subjectTitle: string, subTopicTitle: string, count: number): Promise<string[]> {
  console.log(`Identifying ${count} questions for ${subjectTitle} -> ${subTopicTitle}...`);
  const response = await openai.chat.completions.create({
    model: "meta/llama-3.2-90b-vision-instruct",
    messages: [
      { role: "system", content: "You are a technical interviewer. Reply ONLY with a JSON array of strings containing the questions." },
      {
        role: "user",
        content: `Generate a JSON array of the ${count} most frequently asked, high-value technical interview questions about "${subTopicTitle}" in the context of "${subjectTitle}". Reply with ONLY a valid JSON array of strings like ["Question 1?", "Question 2?"]. Do not use markdown blocks.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content?.trim() || "[]";
  let jsonContent = content;
  if (jsonContent.startsWith("\`\`\`json")) jsonContent = jsonContent.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
  if (jsonContent.startsWith("\`\`\`")) jsonContent = jsonContent.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");
  
  return JSON.parse(jsonContent);
}

async function generateQuestionContent(subject: string, questionTitle: string) {
  const response = await openai.chat.completions.create({
    model: "meta/llama-3.2-90b-vision-instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write the interview answer JSON for the following question.\nSubject: ${subject}\nQuestion: ${questionTitle}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Received empty response");
  
  let jsonContent = content;
  if (jsonContent.startsWith("\`\`\`json")) jsonContent = jsonContent.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
  if (jsonContent.startsWith("\`\`\`")) jsonContent = jsonContent.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");

  return JSON.parse(jsonContent);
}

async function run(slug: string) {
  const subject = getSubjectBySlug(slug);
  if (!subject) {
    console.error(`Subject ${slug} not found.`);
    process.exit(1);
  }

  console.log(`Starting generation for ${subject.title}...`);

  for (const cat of subject.categories) {
    for (const topic of cat.subTopics) {
      const outputDir = path.join(process.cwd(), "content", "generated", slug, topic.id);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      // Generate 8 questions for this topic
      const questions = await identifyQuestions(subject.title, topic.title, 8);
      
      let qIdx = 1;
      for (const qTitle of questions) {
        console.log(`Generating content for: ${qTitle}`);
        try {
          const answerData = await generateQuestionContent(subject.title, qTitle);
          const fullQuestion = {
            id: \`\${slug}-\${topic.id}-\${qIdx}\`,
            question: qTitle,
            difficulty: "Intermediate",
            frequency: 4,
            lastVerified: new Date().toISOString().split("T")[0],
            answer: answerData
          };

          const filePath = path.join(outputDir, \`\${fullQuestion.id}.json\`);
          fs.writeFileSync(filePath, JSON.stringify(fullQuestion, null, 2));
          console.log(\`✅ Saved \${filePath}\`);
        } catch (e) {
          console.error(\`❌ Failed to generate question: \${qTitle}\`, e);
        }
        qIdx++;
      }
    }
  }
  console.log(\`🎉 Generation complete for \${subject.title}!\`);
}

const arg = process.argv[2];
if (!arg) {
  console.log("Usage: tsx generate-subject.ts <subject-slug>");
  process.exit(1);
}
run(arg).catch(console.error);
