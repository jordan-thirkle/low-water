import type { ChatMessage } from "../app/types";
import { supabase } from "./supabase";

export interface RemotePlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

interface RoomCallbacks {
  onPlayer?: (player: RemotePlayer) => void;
  onChat?: (message: ChatMessage) => void;
}

export class RoomTransport {
  private channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
  private readonly roomId: string;
  private readonly callbacks: RoomCallbacks;

  constructor(roomId: string, callbacks: RoomCallbacks) {
    this.roomId = roomId;
    this.callbacks = callbacks;
  }

  async connect(): Promise<"live" | "local"> {
    if (!supabase) return "local";

    this.channel = supabase.channel(`low-water:${this.roomId}`, {
      config: { broadcast: { self: false }, presence: { key: crypto.randomUUID() } },
    });

    this.channel
      .on("broadcast", { event: "player-state" }, ({ payload }) => {
        this.callbacks.onPlayer?.(payload as RemotePlayer);
      })
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        this.callbacks.onChat?.(payload as ChatMessage);
      });

    await this.channel.subscribe();
    return "live";
  }

  publishPlayer(player: RemotePlayer): void {
    void this.channel?.send({ type: "broadcast", event: "player-state", payload: player });
  }

  sendChat(message: ChatMessage): void {
    void this.channel?.send({ type: "broadcast", event: "chat", payload: message });
  }

  dispose(): void {
    if (this.channel && supabase) void supabase.removeChannel(this.channel);
    this.channel = null;
  }
}
