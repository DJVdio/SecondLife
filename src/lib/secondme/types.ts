// SecondMe API 响应类型

export interface SecondMeResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  selfIntroduction: string;
  profileCompleteness: number;
  route: string;
}

export interface Shade {
  id: number;
  shadeName: string;
  shadeIcon: string;
  confidenceLevel: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW";
  shadeDescription: string;
  shadeDescriptionThirdView: string;
  shadeContent: string;
  shadeContentThirdView: string;
  sourceTopics: string[];
  shadeNamePublic: string;
  shadeIconPublic: string;
  confidenceLevelPublic: string;
  shadeDescriptionPublic: string;
  shadeDescriptionThirdViewPublic: string;
  shadeContentPublic: string;
  shadeContentThirdViewPublic: string;
  sourceTopicsPublic: string[];
  hasPublicContent: boolean;
}

export interface ShadesData {
  shades: Shade[];
}

export interface SoftMemory {
  id: number;
  factObject: string;
  factContent: string;
  createTime: number;
  updateTime: number;
}

export interface SoftMemoryData {
  list: SoftMemory[];
  total: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string[];
}
