import type { ChatMessage, Profile } from "../app/types";

const PROFILE_KEY = "low-water:profile:v1";
const CHAT_KEY = "low-water:chat:v1";

const defaultProfile: Profile = {
  id: "guest-local",
  displayName: "Moss",
  xp: 3420,
  rank: 12,
  bankedFinds: 86,
  completedRuns: 18,
  bestCombo: 4.8,
  streak: 3,
  lastPlayedAt: new Date().toISOString(),
};

const defaultChat: ChatMessage[] = [
  { id: "seed-1", author: "Nora", color: "#6C8B91", body: "Found a key by the south crates.", createdAt: "10:21" },
  { id: "seed-2", author: "Kip", color: "#C6A642", body: "I’ll clear the gate. Bring the glass.", createdAt: "10:21" },
  { id: "seed-3", author: "Boomer", color: "#A24E32", body: "Crow nest on the east side.", createdAt: "10:22" },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadProfile(): Profile {
  return readJson(PROFILE_KEY, defaultProfile);
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadChat(): ChatMessage[] {
  return readJson(CHAT_KEY, defaultChat);
}

export function saveChat(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40)));
}

export function resetLocalProgress(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(CHAT_KEY);
}
