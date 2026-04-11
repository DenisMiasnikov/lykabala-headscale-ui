import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasEnvConfig = !!(process.env.HEADSCALE_URL && process.env.HEADSCALE_API_KEY);
  const HEADSCALE_API_KEY_FILE = process.env.HEADSCALE_API_KEY_FILE || "";
  const HEADSCALE_API_KEY = process.env.HEADSCALE_API_KEY || "";
  const fromFs =  fs.readFileSync(HEADSCALE_API_KEY_FILE, "utf8").trim();

  res.json({
    available: hasEnvConfig,
    url: hasEnvConfig ? process.env.HEADSCALE_URL : null,
    apiKey: hasEnvConfig ? HEADSCALE_API_KEY : null,
    apiKeyFile: hasEnvConfig ? HEADSCALE_API_KEY_FILE : null,
    fromFs
  });
}
