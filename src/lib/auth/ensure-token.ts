import { getSession } from "./session";
import { refreshAccessToken } from "../secondme/client";

/**
 * 确保 access token 有效，如果即将过期则自动刷新。
 * 返回有效的 access token，如果无法获取则抛出错误。
 */
export async function ensureFreshToken(): Promise<string> {
  const session = await getSession();

  if (!session.accessToken || !session.refreshToken) {
    throw new Error("Unauthorized");
  }

  // 如果 token 在 5 分钟内过期，提前刷新
  const fiveMinutes = 5 * 60 * 1000;
  if (session.expiresAt && session.expiresAt - Date.now() < fiveMinutes) {
    const tokenData = await refreshAccessToken(session.refreshToken);
    session.accessToken = tokenData.accessToken;
    session.refreshToken = tokenData.refreshToken;
    session.expiresAt = Date.now() + tokenData.expiresIn * 1000;
    await session.save();
  }

  return session.accessToken;
}
