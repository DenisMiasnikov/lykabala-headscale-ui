import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

function getApiKey(): string {
  if (process.env.HEADSCALE_API_KEY) {
    return process.env.HEADSCALE_API_KEY.trim();
  }
  if (process.env.HEADSCALE_API_KEY_FILE) {
    try {
      return fs.readFileSync(process.env.HEADSCALE_API_KEY_FILE, "utf8").trim();
    } catch {
      return "";
    }
  }
  return "";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = getApiKey();
  const hasEnvConfig = !!(process.env.HEADSCALE_URL && apiKey);

  res.json({
    available: hasEnvConfig,
    url: hasEnvConfig ? process.env.HEADSCALE_URL : null,
  });
}
