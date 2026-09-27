#!/usr/bin/env node

/**
 * Revizo Content Generation Pipeline
 * ====================================
 * This script uses an AI API (NVIDIA Nemotron or compatible) to generate
 * interview questions and answers for each subject/category/subtopic.
 *
 * Usage:
 *   NVIDIA_API_KEY=your_key node scripts/generate-content.js --subject java-8
 *
 * Environment Variables:
 *   NVIDIA_API_KEY    - API key for the NVIDIA AI endpoint
 *   AWS_BUCKET_NAME   - S3 bucket name for content storage
 *   AWS_REGION        - AWS region (default: us-east-1)
 *
 * Output:
 *   Generates JSON files in the format:
 *   content/{subject}/{category}/{subtopic}/questions.json
 *
 * Each question follows the 4-part template:
 *   1. What it is — concise definition/explanation
 *   2. What is the use — why it matters
 *   3. Where we can use it — real-world scenarios
 *   4. Code demo — minimal code snippet
 */

const SUBJECTS_CONFIG = [
  {
    id: "java-8",
    title: "Java 8",
    categories: [
      {
        id: "java8-basics",
        title: "Core Java 8 Features",
        subTopics: [
          { id: "lambda-expressions", title: "Lambda Expressions" },
          { id: "method-references", title: "Method References" },
          { id: "functional-interfaces", title: "Functional Interfaces" },
          { id: "default-methods", title: "Default Methods" },
        ],
      },
      {
        id: "java8-streams",
        title: "Stream API",
        subTopics: [
          { id: "stream-basics", title: "Stream Fundamentals" },
          { id: "collectors", title: "Collectors & Reduction" },
          { id: "parallel-streams", title: "Parallel Streams" },
        ],
      },
      {
        id: "java8-optional",
        title: "Optional & Date/Time API",
        subTopics: [
          { id: "optional-class", title: "Optional Class" },
          { id: "date-time-api", title: "Date/Time API (java.time)" },
        ],
      },
    ],
  },
  // Add more subjects as needed...
];

const ANSWER_TEMPLATE_PROMPT = `
You are an expert software engineering interview coach. For the given topic and sub-topic,
identify the top 5 most commonly asked interview questions.

For each question, provide an answer in exactly this 4-part structure:
1. "whatItIs" — A concise but thorough definition/explanation of the concept (2-3 paragraphs)
2. "whatIsTheUse" — Why this matters and what problem it solves (1-2 paragraphs)
3. "whereWeCanUseIt" — Real-world scenarios and when to apply it (1-2 paragraphs)
4. "codeDemo" — A runnable, minimal code snippet illustrating the concept with:
   - "language": the programming language
   - "code": the actual code (well-commented)
   - "explanation": a one-line explanation of the key insight

Return the response as a valid JSON array of question objects.
Each question object should have:
{
  "question": "string",
  "difficulty": "Easy" | "Medium" | "Hard",
  "frequency": 1-5 (how often asked),
  "answer": {
    "whatItIs": "string",
    "whatIsTheUse": "string",
    "whereWeCanUseIt": "string",
    "codeDemo": {
      "language": "string",
      "code": "string",
      "explanation": "string"
    }
  }
}
`;

async function generateQuestionsForSubTopic(subject, category, subTopic) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error("❌ NVIDIA_API_KEY environment variable is not set.");
    console.log("   Set it with: export NVIDIA_API_KEY=your_key_here");
    process.exit(1);
  }

  const prompt = `${ANSWER_TEMPLATE_PROMPT}

Subject: ${subject.title}
Category: ${category.title}
Sub-topic: ${subTopic.title}

Generate the top 5 most commonly asked interview questions for this sub-topic.`;

  console.log(`\n📝 Generating questions for: ${subject.title} > ${category.title} > ${subTopic.title}`);

  try {
    // Example using NVIDIA API (adjust endpoint/model as needed)
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          { role: "system", content: "You are an expert software engineering interview coach. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const questions = JSON.parse(content);

    console.log(`   ✅ Generated ${questions.length || "?"} questions`);
    return questions;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function uploadToS3(path, data) {
  // TODO: Implement S3 upload using AWS SDK
  // const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
  console.log(`   📤 Would upload to S3: ${path}`);

  // For now, write to local filesystem
  const fs = require("fs");
  const dir = require("path").dirname(`content/${path}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`content/${path}`, JSON.stringify(data, null, 2));
  console.log(`   💾 Saved locally: content/${path}`);
}

async function main() {
  console.log("🚀 Revizo Content Generation Pipeline");
  console.log("======================================\n");

  const args = process.argv.slice(2);
  const subjectFilter = args.find((a) => a.startsWith("--subject="))?.split("=")[1];

  const subjects = subjectFilter
    ? SUBJECTS_CONFIG.filter((s) => s.id === subjectFilter)
    : SUBJECTS_CONFIG;

  if (subjects.length === 0) {
    console.error(`❌ Subject "${subjectFilter}" not found. Available: ${SUBJECTS_CONFIG.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  for (const subject of subjects) {
    console.log(`\n📚 Processing subject: ${subject.title}`);
    for (const category of subject.categories) {
      for (const subTopic of category.subTopics) {
        const questions = await generateQuestionsForSubTopic(subject, category, subTopic);
        if (questions) {
          const path = `${subject.id}/${category.id}/${subTopic.id}/questions.json`;
          await uploadToS3(path, {
            subjectId: subject.id,
            categoryId: category.id,
            subTopicId: subTopic.id,
            generatedAt: new Date().toISOString(),
            questions,
          });
        }
      }
    }
  }

  console.log("\n✅ Content generation complete!");
}

main().catch(console.error);
