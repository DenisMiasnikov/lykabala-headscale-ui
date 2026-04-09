import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

export async function uploadToMinIO(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const key = `avatars/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return key; // ✅ IMPORTANT
}
