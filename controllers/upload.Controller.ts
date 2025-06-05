import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { ENV } from "../lib/environments";
import {
  minioClient,
  BUCKET_NAME,
  STREAMING_CONTENT_TYPES,
} from "../lib/s3client";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function transcodeAndUpload(localPath: string, filename: string) {
  const name = path.parse(filename).name;
  const outputDir = path.join(__dirname, `../videos/${name}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const cmd = `ffmpeg -i "${localPath}" \
    -profile:v baseline -level 3.0 -start_number 0 \
    -hls_time 10 -hls_list_size 0 -f hls "${outputDir}/index.m3u8"`;
  execSync(cmd);

  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    const filePath = path.join(outputDir, file);
    const data = fs.readFileSync(filePath);
    await minioClient.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${name}/${file}`,
        Body: data,
        ContentType: file.endsWith(".m3u8")
          ? "application/vnd.apple.mpegurl"
          : "video/MP2T",
      })
    );
  }

  return `${ENV.S3_ENDPOINT}/${BUCKET_NAME}/${name}/index.m3u8`;
}

export async function listVideos(): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Delimiter: "/",
    });

    const { CommonPrefixes = [] } = await minioClient.send(command);

    return CommonPrefixes.map((prefix) => prefix.Prefix?.replace(/\/$/, ""))
      .filter((prefix): prefix is string => !!prefix)
      .map(
        (folder) => `${ENV.S3_ENDPOINT}/${BUCKET_NAME}/${folder}/index.m3u8`
      );
  } catch (error) {
    console.error("Error listing videos:", error);
    throw new Error("Failed to list videos");
  }
}
