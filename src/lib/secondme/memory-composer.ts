import { fetchUserInfo, fetchUserShades, fetchAllSoftMemories } from "./client";
import type { UserInfo, Shade, SoftMemory } from "./types";

export interface ComposedProfile {
  identity: {
    name: string;
    bio: string;
    selfIntroduction: string;
    avatar: string;
  };
  personality: {
    dominantTraits: string[];
    interests: string[];
    descriptions: string[];
  };
  memories: {
    facts: Array<{ category: string; content: string }>;
  };
}

export async function composeUserProfile(
  accessToken: string
): Promise<ComposedProfile> {
  const [userInfo, shadesData, memories] = await Promise.all([
    fetchUserInfo(accessToken),
    fetchUserShades(accessToken),
    fetchAllSoftMemories(accessToken),
  ]);

  return {
    identity: buildIdentity(userInfo),
    personality: buildPersonality(shadesData.shades),
    memories: buildMemories(memories),
  };
}

function buildIdentity(info: UserInfo) {
  return {
    name: info.name,
    bio: info.bio || "",
    selfIntroduction: info.selfIntroduction || "",
    avatar: info.avatar || "",
  };
}

function buildPersonality(shades: Shade[]) {
  const highConfidence = shades.filter((s) =>
    ["HIGH", "VERY_HIGH"].includes(s.confidenceLevel)
  );

  return {
    dominantTraits: highConfidence.map((s) => s.shadeName),
    interests: shades.map((s) => s.shadeName),
    descriptions: highConfidence
      .map((s) => s.shadeContent)
      .filter(Boolean),
  };
}

function buildMemories(memories: SoftMemory[]) {
  return {
    facts: memories.map((m) => ({
      category: m.factObject,
      content: m.factContent,
    })),
  };
}
