import fs from "fs";

const HEADSCALE_URL = process.env.HEADSCALE_URL || "http://headscale:8080";
const HEADSCALE_API_KEY = process.env.HEADSCALE_API_KEY || "";
const HEADSCALE_API_KEY_FILE = process.env.HEADSCALE_API_KEY_FILE || "";

export function getApiKey() {
  if (HEADSCALE_API_KEY) return HEADSCALE_API_KEY.trim();
  if (HEADSCALE_API_KEY_FILE) {
    try {
      return fs.readFileSync(HEADSCALE_API_KEY_FILE, "utf8").trim();
    } catch (err) {
      console.error("Failed to read API key file:", (err as Error).message);
    }
  }
  return "";
}

export async function headscaleFetch(
  path: string,
  options: RequestInit = {}
) {
  const apiKey = getApiKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const response = await fetch(`${HEADSCALE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    signal: controller.signal
  });

  clearTimeout(timeout);
  return response;
}
