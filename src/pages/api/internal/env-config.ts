import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasEnvConfig = !!(process.env.HEADSCALE_URL && process.env.HEADSCALE_API_KEY);
  res.json({ 
    available: hasEnvConfig,
    url: hasEnvConfig ? process.env.HEADSCALE_URL : null
  });
}