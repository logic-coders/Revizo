import * as fs from "fs";
import * as path from "path";
import { uploadToS3 } from "../src/lib/s3";
import * as dotenv from "dotenv";

dotenv.config();

async function walkDir(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(await walkDir(filePath));
    } else if (filePath.endsWith('.json')) {
      results.push(filePath);
    }
  }
  return results;
}

async function publishGenerated() {
  const generatedDir = path.join(process.cwd(), "content", "generated");
  if (!fs.existsSync(generatedDir)) {
    console.log("No generated content found.");
    return;
  }

  const files = await walkDir(generatedDir);
  let totalUploaded = 0;

  for (const file of files) {
    const relativePath = path.relative(generatedDir, file);
    // e.g. java-17/records/java-17-records-1.json -> content/java-17/records/java-17-records-1.json
    const s3Key = \`content/\${relativePath}\`;
    
    try {
      const content = fs.readFileSync(file, "utf8");
      await uploadToS3(s3Key, content);
      console.log(\`✅ Uploaded \${s3Key}\`);
      totalUploaded++;
    } catch (e) {
      console.error(\`❌ Failed to upload \${s3Key}: \`, e);
    }
  }

  console.log(\`\\n🎉 Published \${totalUploaded} reviewed questions to S3!\`);
}

publishGenerated().catch(console.error);
