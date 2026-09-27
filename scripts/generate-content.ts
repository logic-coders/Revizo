import { OpenAI } from "openai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { uploadToS3 } from "../src/lib/s3";

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
    "language": "e.g., java, python, bash, etc.",
    "code": "Code snippet, CLI command, or config."
  },
  "tradeOffs": "When NOT to use this, or its performance costs.",
  "theyMightAskNext": [
    {
      "question": "A likely follow-up question the interviewer will ask",
      "answer": "A concise 1-2 sentence answer"
    }
  ],
  "usedInProduction": "How this is actually used in real-world systems (e.g., 'At scale, this is used to...').",
  "relatedTopics": [
    {
      "title": "Title of a related topic to study",
      "id": "slug-format-of-the-topic"
    }
  ]
}

Ensure the output is ONLY valid JSON, with no markdown code block wrappers (like \`\`\`json) or extra text.
`;

async function generateQuestionContent(subject: string, questionTitle: string) {
  console.log(`Generating content for: ${subject} - ${questionTitle}...`);

  try {
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
      top_p: 1,
      stream: false,
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error("Received empty response from the API.");
    }

    // Strip markdown code blocks if the model outputs them despite instructions
    let jsonContent = content;
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }

    const parsedJson = JSON.parse(jsonContent);
    return parsedJson;
  } catch (error) {
    console.error(`Error generating content for ${questionTitle}:`, error);
    throw error;
  }
}

async function main() {
  const outputDir = path.join(process.cwd(), "content", "generated");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Example task: generate a few questions for a new topic
  const subject = "Kafka";
  const questions = [
    { id: "kafka-1", title: "What is a Kafka partition and why is it important?" },
    { id: "kafka-2", title: "How does Kafka achieve high throughput?" }
  ];

  for (const q of questions) {
    const content = await generateQuestionContent(subject, q.title);
    
    const fullQuestionObject = {
      id: q.id,
      question: q.title,
      difficulty: "Intermediate",
      frequency: 5,
      lastVerified: new Date().toISOString().split("T")[0],
      answer: content
    };

    const s3Key = `content/${subject.toLowerCase()}/${q.id}.json`;
    
    // Save locally
    const filePath = path.join(outputDir, `${q.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullQuestionObject, null, 2));
    
    // Upload to S3
    await uploadToS3(s3Key, JSON.stringify(fullQuestionObject, null, 2));
    console.log(`Saved ${q.id} to local and uploaded to S3: ${s3Key}`);
    
    // Slight delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("Done! Check the /content/generated folder.");
}

main().catch(console.error);
