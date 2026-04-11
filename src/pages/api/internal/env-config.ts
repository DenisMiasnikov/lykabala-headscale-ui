import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const HEADSCALE_API_KEY_FROM_FILE =  fs.readFileSync(process.env.HEADSCALE_API_KEY_FILE || "", "utf8").trim();
  const hasEnvConfig = !!(process.env.HEADSCALE_URL && process.env.HEADSCALE_API_KEY) || HEADSCALE_API_KEY_FROM_FILE;

  res.json({
    available: hasEnvConfig,
    url: hasEnvConfig ? (process.env.HEADSCALE_URL || "http://headscale:8080") : null,
  });
}
