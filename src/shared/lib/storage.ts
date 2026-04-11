import { decrypt } from "./crypto";
import fs from "fs";

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  encryptedKey: string;
  username?: string;
  lastUsed: number;
}

const STORAGE_KEY = "headscale_servers";
const ACTIVE_KEY = "headscale_active_server";

function generateId(): string {
  return crypto.randomUUID();
}

function getServersFromStorage(): ServerConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveServersToStorage(servers: ServerConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
}

export function getServers(): ServerConfig[] {
  return getServersFromStorage().sort((a, b) => b.lastUsed - a.lastUsed);
}

export function getActiveServerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveServerId(id: string): void {
  if (typeof window === "undefined") return;
  const servers = getServersFromStorage();
  const server = servers.find((s) => s.id === id);
  if (server) {
    server.lastUsed = Date.now();
    saveServersToStorage(servers);
    localStorage.setItem(ACTIVE_KEY, id);
  }
}

export async function addServer(
  name: string,
  url: string,
  encryptedApiKey: string,
  username?: string
): Promise<ServerConfig> {
  const server: ServerConfig = {
    id: generateId(),
    name,
    url: url.replace(/\/$/, ""),
    encryptedKey: encryptedApiKey,
    username,
    lastUsed: Date.now(),
  };
  const servers = getServersFromStorage();
  servers.push(server);
  saveServersToStorage(servers);
  setActiveServerId(server.id);
  return server;
}

export function removeServer(id: string): void {
  const servers = getServersFromStorage().filter((s) => s.id !== id);
  saveServersToStorage(servers);
  if (getActiveServerId() === id) {
    const remaining = getServersFromStorage();
    if (remaining.length > 0) {
      setActiveServerId(remaining.sort((a, b) => b.lastUsed - a.lastUsed)[0].id);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }
}

export async function getDecryptedApiKey(
  serverId: string,
  masterPassword: string
): Promise<string | null> {
  const servers = getServersFromStorage();
  const server = servers.find((s) => s.id === serverId);
  if (!server) return null;
  return decrypt(server.encryptedKey, masterPassword);
}

export async function getActiveServerConfig(
  masterPassword: string
): Promise<{ url: string; apiKey: string; name: string } | null> {
  const activeId = getActiveServerId();
  if (!activeId) return null;
  const servers = getServersFromStorage();
  const server = servers.find((s) => s.id === activeId);
  if (!server) return null;
  const apiKey = await decrypt(server.encryptedKey, masterPassword);
  if (!apiKey) return null;
  return { url: server.url, apiKey, name: server.name };
}

export function hasServers(): boolean {
  return getServers().length > 0;
}

export async function checkEnvConfig(): Promise<{ url: string; apiKey: string } | null> {
  try {
    const res = await fetch("/api/internal/env-config");
    const data = await res.json();
    if (data.available) {
      const key = fs.readFileSync(process.env.HEADSCALE_API_KEY_FILE || "", "utf8").trim()
      return { url: data.url, apiKey: process.env.HEADSCALE_API_KEY || key || "" };
    }
  } catch {}
  return null;
}

export function getServerNames(): { id: string; name: string; url: string }[] {
  return getServers().map((s) => ({ id: s.id, name: s.name, url: s.url }));
}
