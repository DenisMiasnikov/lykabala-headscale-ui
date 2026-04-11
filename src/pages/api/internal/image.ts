import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "./_auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Helper to convert S3 stream to buffer
async function streamToBuffer(stream: Readable | any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

const s3Client = new S3Client({
  endpoint: "http://minio:9000", // Docker hostname
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

const BUCKET = "avatars";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate request
  if (!requireAuth(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = req.query.key as string;
  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return res.status(404).json({ error: "File not found" });
    }

    const buffer = await streamToBuffer(response.Body);

    res.setHeader("Content-Type", response.ContentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600"); // optional caching
    return res.send(buffer);
  } catch (err: any) {
    console.error("Image retrieval error:", err);
    return res.status(500).json({ error: "Failed to load image" });
  }
}
