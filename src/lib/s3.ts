import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, ListObjectsV2CommandOutput, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
dotenv.config();


export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "revizo-content";

export async function uploadToS3(key: string, body: string, contentType: string = "application/json") {
  const putCmd = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await s3Client.send(putCmd);
}

export async function fetchFromS3(key: string): Promise<string> {
  const getCmd = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response: GetObjectCommandOutput = await s3Client.send(getCmd);
  return await response.Body?.transformToString() || "";
}

export async function listAllS3Keys(prefix: string = ""): Promise<string[]> {
  const keys: string[] = [];
  let isTruncated = true;
  let continuationToken: string | undefined = undefined;

  while (isTruncated) {
    const listCmd = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response: ListObjectsV2CommandOutput = await s3Client.send(listCmd);
    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key && item.Key.endsWith(".json")) {
          keys.push(item.Key);
        }
      }
    }

    isTruncated = response.IsTruncated ?? false;
    continuationToken = response.NextContinuationToken;
  }

  return keys;
}
