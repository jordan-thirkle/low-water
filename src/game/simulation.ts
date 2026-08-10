import type { LootItem, LootKind, RunSnapshot } from "../app/types";

export interface PlayerPoint {
  x: number;
  y: number;
}

const WORLD_WIDTH = 1536;
const WORLD_HEIGHT = 1024;
const RUN_LENGTH = 90;

const lootKinds: LootKind[] = ["key", "bottle", "parcel", "relic"];

export class LowWaterSimulation {
  readonly world = { width: WORLD_WIDTH, height: WORLD_HEIGHT };
  readonly player: PlayerPoint = { x: 760, y: 690 };
  readonly loot: LootItem[] = [];
  private phase: RunSnapshot["phase"] = "ready";
  private elapsed = 0;
  private carriedValue = 0;
  private bankedValue = 0;
  private combo = 0;
  private lastFind: LootKind | null = null;
  private wave = 3;
  private risk = 38;
  private totalFinds = 0;
  private pushes = 0;

  constructor() {
    this.seedLoot();
  }

  private seedLoot(): void {
    const locations = [
      [470, 350], [615, 500], [835, 330], [1010, 480], [1180, 680], [380, 760],
      [560, 860], [805, 775], [995, 850], [1240, 380], [280, 450], [1280, 780],
      [720, 610], [1080, 260], [350, 250], [1140, 560], [650, 270], [900, 690],
      [460, 620], [1220, 900], [260, 860], [1320, 510], [740, 900], [1050, 740],
    ];
    locations.forEach(([x, y], index) => {
      this.loot.push({
        id: index,
        x,
        y,
        value: [11, 4, 7, 16][index % 4],
        kind: lootKinds[index % lootKinds.length],
        collected: false,
      });
    });
  }

  start(): void {
    if (this.phase === "running") return;
    this.phase = "running";
  }

  move(dx: number, dy: number, deltaSeconds: number): void {
    if (this.phase === "ready") this.start();
    if (this.phase !== "running") return;

    const length = Math.hypot(dx, dy) || 1;
    const speed = 250;
    this.player.x = Math.max(90, Math.min(WORLD_WIDTH - 90, this.player.x + (dx / length) * speed * deltaSeconds));
    this.player.y = Math.max(115, Math.min(WORLD_HEIGHT - 90, this.player.y + (dy / length) * speed * deltaSeconds));
    this.collectNearby();
  }

  tick(deltaSeconds: number): void {
    if (this.phase !== "running") return;
    this.elapsed += deltaSeconds;
    if (this.elapsed >= RUN_LENGTH) this.phase = "lost";
  }

  private collectNearby(): void {
    for (const item of this.loot) {
      if (item.collected) continue;
      if (Math.hypot(item.x - this.player.x, item.y - this.player.y) > 46) continue;
      item.collected = true;
      this.carriedValue += item.value;
      this.totalFinds += 1;
      this.combo = this.lastFind === item.kind ? Math.min(9.9, this.combo + 0.4) : Math.min(9.9, this.combo + 0.2);
      this.lastFind = item.kind;
    }
  }

  bank(): void {
    if (this.phase !== "running" || this.carriedValue <= 0) return;
    const comboMultiplier = 1 + 0.15 * Math.min(3, this.combo);
    this.bankedValue += Math.round(this.carriedValue * comboMultiplier);
    this.carriedValue = 0;
    this.combo = Math.max(1, this.combo * 0.62);
    this.risk = Math.max(20, this.risk - 9);
  }

  pushTide(): void {
    if (this.phase !== "running" || this.pushes >= 2) return;
    this.pushes += 1;
    this.wave += 1;
    this.risk = Math.min(92, this.risk + 17);
    this.elapsed = Math.max(0, this.elapsed - 14);
    this.loot.forEach((item, index) => {
      if (!item.collected && index % 3 === this.wave % 3) item.value += 5;
    });
  }

  extract(): void {
    if (this.phase !== "running") return;
    this.bank();
    this.phase = "extracted";
  }

  snapshot(): RunSnapshot {
    const collected = this.loot.filter((item) => item.collected).length;
    return {
      phase: this.phase,
      elapsed: this.elapsed,
      remaining: Math.max(0, RUN_LENGTH - this.elapsed),
      collected,
      target: this.loot.length,
      carriedValue: this.carriedValue,
      bankedValue: this.bankedValue,
      combo: this.combo,
      wave: this.wave,
      risk: this.risk,
      totalFinds: this.totalFinds,
      lastFind: this.lastFind,
    };
  }
}
