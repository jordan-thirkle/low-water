export type AppTab = "run" | "crew" | "found-book";

export type LootKind = "key" | "bottle" | "parcel" | "relic";

export type RunPhase = "ready" | "running" | "banked" | "extracted" | "lost";

export interface LootItem {
  id: number;
  x: number;
  y: number;
  value: number;
  kind: LootKind;
  collected: boolean;
}

export interface RunSnapshot {
  phase: RunPhase;
  elapsed: number;
  remaining: number;
  collected: number;
  target: number;
  carriedValue: number;
  bankedValue: number;
  combo: number;
  wave: number;
  risk: number;
  totalFinds: number;
  lastFind: LootKind | null;
}

export interface Profile {
  id: string;
  displayName: string;
  xp: number;
  rank: number;
  bankedFinds: number;
  completedRuns: number;
  bestCombo: number;
  streak: number;
  lastPlayedAt: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  color: string;
  body: string;
  createdAt: string;
  local?: boolean;
}

export interface DailyContract {
  title: string;
  detail: string;
  progress: number;
  target: number;
  reward: number;
}
