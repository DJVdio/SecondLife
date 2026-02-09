import type { Attributes, LifeStage } from "./types";

const STAGES: LifeStage[] = [
  "birth",
  "childhood",
  "youth",
  "adulthood",
  "middle_age",
  "elder",
];

export function getNextStage(current: LifeStage): LifeStage | null {
  const idx = STAGES.indexOf(current);
  if (idx === -1 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1];
}

export function generateRandomAttributes(): Attributes {
  const rand = () => Math.floor(Math.random() * 60) + 20; // 20-80
  return {
    happiness: rand(),
    wealth: rand(),
    health: rand(),
    intelligence: rand(),
    charisma: rand(),
    luck: rand(),
  };
}

export function applyAttributeChanges(
  current: Attributes,
  changes: Partial<Attributes>
): Attributes {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    happiness: clamp(current.happiness + (changes.happiness || 0)),
    wealth: clamp(current.wealth + (changes.wealth || 0)),
    health: clamp(current.health + (changes.health || 0)),
    intelligence: clamp(current.intelligence + (changes.intelligence || 0)),
    charisma: clamp(current.charisma + (changes.charisma || 0)),
    luck: clamp(current.luck + (changes.luck || 0)),
  };
}
