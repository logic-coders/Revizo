import { subjects } from "../src/data/subjects";
import { uploadToS3 } from "../src/lib/s3";
import * as dotenv from "dotenv";

dotenv.config();

async function seedS3() {
  console.log("Starting S3 seed process...");
  
  let totalUploaded = 0;

  for (const subject of subjects) {
    for (const category of subject.categories) {
      for (const topic of category.subTopics) {
        for (const question of topic.questions) {
          const s3Key = `content/${subject.slug}/${topic.id}/${question.id}.json`;
          
          try {
            await uploadToS3(s3Key, JSON.stringify(question, null, 2));
            console.log(`✅ Uploaded ${s3Key}`);
            totalUploaded++;
          } catch (error) {
            console.error(`❌ Failed to upload ${s3Key}:`, error);
          }
        }
      }
    }
  }

  console.log(`\n🎉 S3 Seeding Complete! Uploaded ${totalUploaded} questions to S3.`);
}

seedS3().catch(console.error);
