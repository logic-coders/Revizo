import * as fs from "fs";
import * as path from "path";
import { fetchFromS3, listAllS3Keys } from "../src/lib/s3";
import { subjects as templateSubjects } from "../src/data/subjects-schema"; // we will create this

async function syncS3() {
  console.log("Starting S3 Sync. Fetching latest questions from cloud...");

  const keys = await listAllS3Keys("content/");
  console.log(`Found ${keys.length} questions in S3.`);

  // Deep clone the template so we don't mutate the original module
  const subjects = JSON.parse(JSON.stringify(templateSubjects));

  let downloadedCount = 0;

  for (const key of keys) {
    try {
      const jsonContent = await fetchFromS3(key);
      const questionData = JSON.parse(jsonContent);

      // key format: content/[subject-slug]/[topic-id]/[question-id].json
      const parts = key.split("/");
      const subjectSlug = parts[1];
      const topicId = parts[2];

      const subject = subjects.find((s: any) => s.slug === subjectSlug);
      if (subject) {
        let foundTopic = false;
        for (const cat of subject.categories) {
          const topic = cat.subTopics.find((t: any) => t.id === topicId);
          if (topic) {
            topic.questions = topic.questions || [];
            // Remove existing question if it has the same ID (to allow overwrites)
            topic.questions = topic.questions.filter((q: any) => q.id !== questionData.id);
            topic.questions.push(questionData);
            foundTopic = true;
            downloadedCount++;
            break;
          }
        }
        if (!foundTopic) {
          console.warn(`Topic ${topicId} not found in schema for subject ${subjectSlug}.`);
        }
      }
    } catch (e) {
      console.error(`Failed to process ${key}:`, e);
    }
  }

  // Write out the synced subjects file
  const outputPath = path.join(process.cwd(), "src", "data", "subjects-synced.json");
  
  // We write it out as JSON
  const fileContent = JSON.stringify(subjects, null, 2);

  fs.writeFileSync(outputPath, fileContent);
  console.log(`✅ S3 Sync Complete. Downloaded ${downloadedCount} questions and generated src/data/subjects.ts.`);
}

syncS3().catch(console.error);
