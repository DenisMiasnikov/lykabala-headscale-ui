import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "./_auth";
import { uploadToMinIO } from "../../../shared/lib/minio";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, contentType, base64Data } = req.body || {};

    if (!fileName || !contentType || !base64Data) {
      return res.status(400).json({ error: "Missing file data" });
    }

    const base64Buffer = base64Data.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Buffer, "base64");

    const key = await uploadToMinIO(fileName, buffer, contentType);

    return res.json({ key }); // ✅ return key only
  } catch (err) {
    console.error("Upload error FULL:", err);
    return res.status(500).json({
      error: "Upload failed",
      details: (err as any)?.message,
    });
  }
}
