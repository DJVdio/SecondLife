export type LifeStage =
  | "birth"
  | "childhood"
  | "youth"
  | "adulthood"
  | "middle_age"
  | "elder";

export interface Attributes {
  happiness: number;
  wealth: number;
  health: number;
  intelligence: number;
  charisma: number;
  luck: number;
}

export interface LifeEvent {
  age: number;
  text: string;
  attribute_changes?: Partial<Attributes>;
}

export interface StageChoice {
  text: string;
  hint: string;
}

export interface StageResult {
  stage: string;
  age_range: string;
  events: LifeEvent[];
  choices: StageChoice[];
  stage_summary: string;
  updated_attributes: Attributes;
  // 最终阶段特有字段
  death_age?: number;
  death_cause?: string;
  epitaph?: string;
  life_rating?: string;
  final_summary?: string;
}

export interface GameState {
  stage: LifeStage;
  sessionId: string | null;
  attributes: Attributes;
  events: LifeEvent[];
  stageResults: StageResult[];
  isStreaming: boolean;
  isComplete: boolean;
}
