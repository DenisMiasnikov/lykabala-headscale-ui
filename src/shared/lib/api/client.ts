import { getActiveServerId, getServers, setActiveServerId } from "../storage";

export function hasServerConfig(): boolean {
  return typeof window !== "undefined" && getServers().length > 0;
}

export function getServerHeaders() {
  if (typeof window === "undefined") return {};
  const servers = getServers();
  if (servers.length === 0) return {};
  const activeId = getActiveServerId() || servers[0].id;
  const server = servers.find(function(s) { return s.id === activeId; });
  if (!server) return {};
  return {
    "X-Headscale-Url": server.url,
    "X-Headscale-ApiKey": server.encryptedKey,
  };
}

export function getStoredServers() {
  return getServers();
}

export function selectServer(serverId: string) {
  setActiveServerId(serverId);
}