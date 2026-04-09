import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "./_auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// endpoint: process.env.MINIO_ENDPOINT || "http://minio:9000",

const s3Client = new S3Client({
  endpoint: "http://minio:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET || "avatars";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;

  const { key } = req.query;

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 60, // 🔐 short-lived
    });

    return res.redirect(url);
  } catch (err) {
    console.error("Image error:", err);
    return res.status(500).json({ error: "Failed to load image" });
  }
}
