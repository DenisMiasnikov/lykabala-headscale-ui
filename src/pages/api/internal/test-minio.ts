// /pages/api/test-minio.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { s3Client } from "../../../shared/lib/minio";
import { ListBucketsCommand } from "@aws-sdk/client-s3";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    res.json({ buckets: data.Buckets });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
