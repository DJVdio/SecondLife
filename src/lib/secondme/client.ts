import type {
  SecondMeResponse,
  UserInfo,
  ShadesData,
  SoftMemoryData,
  SoftMemory,
  TokenData,
} from "./types";

const BASE_URL = process.env.SECONDME_BASE_URL!;

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json: SecondMeResponse<T> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || `SecondMe API error: ${json.code}`);
  }
  return json.data;
}

export async function fetchUserInfo(token: string): Promise<UserInfo> {
  return apiGet<UserInfo>("/api/secondme/user/info", token);
}

export async function fetchUserShades(token: string): Promise<ShadesData> {
  return apiGet<ShadesData>("/api/secondme/user/shades", token);
}

export async function fetchSoftMemory(
  token: string,
  pageNo = 1,
  pageSize = 100
): Promise<SoftMemoryData> {
  return apiGet<SoftMemoryData>(
    `/api/secondme/user/softmemory?pageNo=${pageNo}&pageSize=${pageSize}`,
    token
  );
}

export async function fetchAllSoftMemories(
  token: string
): Promise<SoftMemory[]> {
  const all: SoftMemory[] = [];
  let pageNo = 1;

  while (pageNo <= 5) {
    const data = await fetchSoftMemory(token, pageNo, 100);
    all.push(...data.list);
    if (all.length >= data.total) break;
    pageNo++;
  }

  return all;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<TokenData> {
  const res = await fetch(`${BASE_URL}/api/oauth/token/code`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  });
  const json: SecondMeResponse<TokenData> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "Token exchange failed");
  }
  return json.data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenData> {
  const res = await fetch(`${BASE_URL}/api/oauth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    }),
  });
  const json: SecondMeResponse<TokenData> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "Token refresh failed");
  }
  return json.data;
}

export function buildChatStreamRequest(
  token: string,
  message: string,
  options: { sessionId?: string; systemPrompt?: string } = {}
): { url: string; init: RequestInit } {
  return {
    url: `${BASE_URL}/api/secondme/chat/stream`,
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        ...(options.sessionId && { sessionId: options.sessionId }),
        ...(options.systemPrompt && { systemPrompt: options.systemPrompt }),
      }),
    },
  };
}
