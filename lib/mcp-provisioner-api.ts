// MCP Provisioner API service
import { apiCall } from './api-utils';

interface CreateServerRequest {
  server_type: string;
  agents: string[];
}

interface ServerResponse {
  server_id: string;
  endpoint: string;
  mcp_endpoint: string;
}

interface ServerDetailsResponse extends ServerResponse {
  docker_image: string;
  container_name: string;
  server_type_exe: string;
  base_port: string;
  path_prefix: string;
  traefik_network: string;
  host_domain: string;
  supported_agents: string | string[];
}

interface ListServersResponse {
  servers: ServerResponse[];
}

interface DeleteServerResponse {
  success: boolean;
  message: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_new?: boolean;
  is_updated?: boolean;
}

export interface AgentsResponse {
  agents: Agent[];
}

// Use relative API routes instead of direct external API calls to avoid CORS issues
const API_BASE_URL = '/api';

/**
 * Fetch all available agents
 */
export async function getAgents(): Promise<AgentsResponse> {
  return apiCall({
    endpoint: 'agents',
    baseUrl: API_BASE_URL,
    cacheOptions: {
      enabled: true,
      duration: 5 * 60 * 1000, // 5 minutes
      keyPrefix: 'agents'
    }
  });
}

/**
 * Create a new MCP server with specified agents
 */
export async function createServer(
  apiKey: string,
  agents: string[],
): Promise<ServerResponse> {
  return apiCall({
    endpoint: 'servers',
    method: 'POST',
    baseUrl: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      server_type: 'tool',
      agents,
    },
  });
}

/**
 * List all active servers for the current user
 */
export async function listServers(
  apiKey: string,
): Promise<ListServersResponse> {
  return apiCall({
    endpoint: 'servers',
    baseUrl: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

/**
 * Get details for a specific server
 */
export async function getServerDetails(
  apiKey: string,
  serverId: string,
): Promise<ServerDetailsResponse> {
  return apiCall({
    endpoint: 'servers/details',
    method: 'POST',
    baseUrl: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      server_id: serverId,
    },
  });
}

/**
 * Delete a specific server
 */
export async function deleteServer(
  apiKey: string,
  serverId: string,
): Promise<DeleteServerResponse> {
  return apiCall({
    endpoint: 'servers/delete',
    method: 'POST',
    baseUrl: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      server_id: serverId,
    },
  });
}
