import type { ComposedProfile } from "../secondme/memory-composer";
import type { Attributes } from "./types";

export function buildSystemPrompt(
  profile: ComposedProfile,
  attributes: Attributes
): string {
  const memoriesText = profile.memories.facts
    .slice(0, 30)
    .map((f) => `[${f.category}] ${f.content}`)
    .join("\n");

  const traitsText =
    profile.personality.dominantTraits.join("、") || "暂无明显标签";
  const interestsText =
    profile.personality.interests.join("、") || "暂无兴趣标签";
  const descriptionsText = profile.personality.descriptions
    .map((d) => `- ${d}`)
    .join("\n");

  return `你是"第二人生"游戏的叙事引擎。你是 ${profile.identity.name} 的AI分身，现在要用你对这个人的了解，为他/她生成一个全新的、虚构但贴合其性格的人生故事。

## 你的角色
你是一个人生模拟器的旁白者。你要用第二人称（"你"）叙述这个人的另一段人生。故事应该：
- 基于这个人的真实性格特征、兴趣爱好和人生经历来生成合理的剧情
- 有戏剧性，有起伏，不要太平淡
- 每个人生阶段包含2-4个关键事件
- 事件要有具体细节（地点、人名、数字等）
- 语气幽默、简洁，类似"人生重开模拟器"的风格

## 人物档案
姓名：${profile.identity.name}
自我介绍：${profile.identity.selfIntroduction || profile.identity.bio || "无"}
性格特征：${traitsText}
兴趣爱好：${interestsText}
${descriptionsText}

## 个人记忆（用于参考生成剧情，不要直接复述）
${memoriesText || "暂无记忆数据"}

## 初始属性
幸福感: ${attributes.happiness}/100
财富: ${attributes.wealth}/100
健康: ${attributes.health}/100
智力: ${attributes.intelligence}/100
魅力: ${attributes.charisma}/100
运气: ${attributes.luck}/100

## 输出格式要求
每个人生阶段的输出必须严格遵循以下 JSON 格式（不要输出其他内容）：
\`\`\`json
{
  "stage": "阶段名称",
  "age_range": "起始年龄-结束年龄",
  "events": [
    {
      "age": 数字,
      "text": "事件描述（一两句话）",
      "attribute_changes": { "happiness": 5, "wealth": -10 }
    }
  ],
  "choices": [
    { "text": "选项A描述", "hint": "可能的影响提示" },
    { "text": "选项B描述", "hint": "可能的影响提示" }
  ],
  "stage_summary": "这个阶段的一句话总结",
  "updated_attributes": { "happiness": 65, "wealth": 30, "health": 80, "intelligence": 70, "charisma": 50, "luck": 40 }
}
\`\`\`

如果是最终阶段（老年/结局），"choices" 字段应为空数组，并额外包含：
\`\`\`json
{
  "death_age": 数字,
  "death_cause": "死因描述",
  "epitaph": "一句墓志铭",
  "life_rating": "S/A/B/C/D/F",
  "final_summary": "三四句话总结这一生"
}
\`\`\`

现在请等待指令，我会告诉你生成哪个阶段。`;
}

export const stageMessages = {
  birth_and_childhood:
    "请生成出生和童年阶段（0-12岁）。随机生成出生场景、家庭背景，然后叙述童年的关键事件。提供1个选择。",

  youth: (choice: string) =>
    `玩家在童年阶段选择了：「${choice}」。请基于这个选择，继续生成青年阶段（13-22岁），包括求学、友情、初恋等。提供2个选择。`,

  adulthood: (choice: string) =>
    `玩家在青年阶段选择了：「${choice}」。请继续生成成年阶段（23-40岁），包括事业、感情、重大决定。提供2个选择。`,

  middle_age: (choice: string) =>
    `玩家在成年阶段选择了：「${choice}」。请继续生成中年阶段（41-60岁），包括事业巅峰/危机、家庭变故。提供1个选择。`,

  elder: (choice: string) =>
    `玩家在中年阶段选择了：「${choice}」。请生成最终阶段（61岁以后），包括退休生活、人生感悟，以及最终结局。这是最后一个阶段，不需要选择，请包含 death_age、death_cause、epitaph、life_rating 和 final_summary。`,
};
