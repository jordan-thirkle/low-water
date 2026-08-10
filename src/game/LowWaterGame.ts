import Phaser from "phaser";
import type { RunSnapshot } from "../app/types";
import type { RemotePlayer } from "../lib/multiplayer";
import { LowWaterSimulation } from "./simulation";

export interface LowWaterGameController {
  bank: () => void;
  pushTide: () => void;
  extract: () => void;
  restart: () => void;
  setRemotePlayer: (player: RemotePlayer) => void;
}

interface LowWaterGameOptions {
  parent: HTMLElement;
  onSnapshot: (snapshot: RunSnapshot) => void;
  onReady: (controller: LowWaterGameController) => void;
  onPlayerState?: (player: Pick<RemotePlayer, "x" | "y">) => void;
}

const COLORS = {
  paper: 0xe8e0cf,
  mustard: 0xc6a642,
  rust: 0xa24e32,
  slate: 0x3c4a4d,
};

class LowWaterScene extends Phaser.Scene {
  private readonly onSnapshot: (snapshot: RunSnapshot) => void;
  private readonly onReady: (controller: LowWaterGameController) => void;
  private readonly onPlayerState?: (player: Pick<RemotePlayer, "x" | "y">) => void;
  private simulation = new LowWaterSimulation();
  private playerSprite!: Phaser.GameObjects.Image;
  private findSprites = new Map<number, Phaser.GameObjects.Image>();
  private remoteSprites: Phaser.GameObjects.Image[] = [];
  private crowSprites: Phaser.GameObjects.Image[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private bankKey!: Phaser.Input.Keyboard.Key;
  private pushKey!: Phaser.Input.Keyboard.Key;
  private extractKey!: Phaser.Input.Keyboard.Key;
  private lastEmit = 0;
  private elapsedSinceStart = 0;
  private elapsedSincePlayerEmit = 0;
  private liveRemotePlayerId: string | null = null;

  constructor(options: Pick<LowWaterGameOptions, "onSnapshot" | "onReady" | "onPlayerState">) {
    super("LOW-WATER-RUN");
    this.onSnapshot = options.onSnapshot;
    this.onReady = options.onReady;
    this.onPlayerState = options.onPlayerState;
  }

  preload(): void {
    this.load.image("arena", "/assets/generated/low-water-yard.jpg");
    this.load.image("player", "/assets/generated/low-water-player.png");
    this.load.image("crow", "/assets/generated/low-water-crow.png");
    this.load.image("key", "/assets/generated/low-water-key.png");
  }

  create(): void {
    const { width, height } = this.simulation.world;
    this.add.image(width / 2, height / 2, "arena").setDisplaySize(width, height);

    this.add.rectangle(760, 116, 520, 118, COLORS.paper, 0.08).setStrokeStyle(2, COLORS.paper, 0.24);
    this.add.text(760, 116, "SORTING TABLE", {
      fontFamily: "Arial Narrow, Arial, sans-serif",
      fontSize: "17px",
      color: "#e8e0cf",
      fontStyle: "bold",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.72);

    this.playerSprite = this.add.image(this.simulation.player.x, this.simulation.player.y, "player").setDisplaySize(52, 76);
    this.playerSprite.setDepth(10);

    const remotePositions = [[650, 450], [920, 520], [1120, 710]];
    remotePositions.forEach(([x, y], index) => {
      const sprite = this.add.image(x, y, "player").setDisplaySize(42, 62).setDepth(8);
      sprite.setTint([0x6c8b91, 0xc6a642, 0xa24e32][index]);
      this.remoteSprites.push(sprite);
    });

    [[510, 455], [1030, 330], [1270, 635], [300, 650]].forEach(([x, y]) => {
      const crow = this.add.image(x, y, "crow").setDisplaySize(46, 46).setDepth(9);
      this.crowSprites.push(crow);
    });

    for (const item of this.simulation.loot) {
      const sprite = this.add.image(item.x, item.y, "key").setDisplaySize(27, 27).setDepth(5);
      sprite.setAngle((item.id * 31) % 360);
      sprite.setTint([0xc6a642, 0x6c8b91, 0xa24e32, 0x4c6255][item.id % 4]);
      this.findSprites.set(item.id, sprite);
    }

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.bankKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.pushKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.extractKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.playerSprite, true, 0.12, 0.12);
    this.cameras.main.setZoom(0.74);
    this.simulation.start();

    this.onReady({
      bank: () => this.bank(),
      pushTide: () => this.pushTide(),
      extract: () => this.extract(),
      restart: () => this.restart(),
      setRemotePlayer: (player) => this.setRemotePlayer(player),
    });
    this.emitSnapshot(true);
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = Math.min(delta / 1000, 0.05);
    const dx = Number(this.cursors.right.isDown || this.wasd.right.isDown) - Number(this.cursors.left.isDown || this.wasd.left.isDown);
    const dy = Number(this.cursors.down.isDown || this.wasd.down.isDown) - Number(this.cursors.up.isDown || this.wasd.up.isDown);
    let moveX = dx;
    let moveY = dy;

    const pointer = this.input.activePointer;
    if (!dx && !dy && pointer.isDown) {
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      moveX = worldPoint.x - this.simulation.player.x;
      moveY = worldPoint.y - this.simulation.player.y;
    }

    this.simulation.move(moveX, moveY, deltaSeconds);
    this.simulation.tick(deltaSeconds);
    this.playerSprite.setPosition(this.simulation.player.x, this.simulation.player.y);

    this.remoteSprites.forEach((sprite, index) => {
      if (index === 0 && this.liveRemotePlayerId) return;
      const base = [[650, 450], [920, 520], [1120, 710]][index];
      sprite.setPosition(base[0] + Math.sin(this.time.now / 900 + index) * 72, base[1] + Math.cos(this.time.now / 1100 + index) * 52);
    });
    this.crowSprites.forEach((sprite, index) => {
      sprite.setAngle(Math.sin(this.time.now / 500 + index) * 3);
      sprite.setScale(0.96 + Math.sin(this.time.now / 360 + index) * 0.04);
    });

    if (Phaser.Input.Keyboard.JustDown(this.bankKey)) this.bank();
    if (Phaser.Input.Keyboard.JustDown(this.pushKey)) this.pushTide();
    if (Phaser.Input.Keyboard.JustDown(this.extractKey)) this.extract();
    this.refreshLootVisibility();
    this.elapsedSincePlayerEmit += delta;
    if (this.elapsedSincePlayerEmit >= 120) {
      this.elapsedSincePlayerEmit = 0;
      this.onPlayerState?.({ x: this.simulation.player.x, y: this.simulation.player.y });
    }
    this.emitSnapshot();
  }

  private setRemotePlayer(player: RemotePlayer): void {
    const sprite = this.remoteSprites[0];
    if (!sprite) return;
    this.liveRemotePlayerId = player.id;
    sprite.setVisible(true);
    sprite.setPosition(player.x, player.y);
    sprite.setTint(Number.parseInt(player.color.replace("#", ""), 16) || COLORS.mustard);
  }

  private refreshLootVisibility(): void {
    for (const item of this.simulation.loot) {
      const sprite = this.findSprites.get(item.id);
      if (sprite) sprite.setVisible(!item.collected);
    }
  }

  private bank(): void {
    this.simulation.bank();
    this.emitSnapshot(true);
  }

  private pushTide(): void {
    this.simulation.pushTide();
    this.emitSnapshot(true);
  }

  private extract(): void {
    this.simulation.extract();
    this.emitSnapshot(true);
  }

  private restart(): void {
    this.simulation = new LowWaterSimulation();
    this.simulation.start();
    this.liveRemotePlayerId = null;
    this.elapsedSincePlayerEmit = 0;
    this.playerSprite.setPosition(this.simulation.player.x, this.simulation.player.y);
    for (const [id, sprite] of this.findSprites) {
      sprite.setVisible(true);
      const item = this.simulation.loot.find((loot) => loot.id === id);
      if (item) sprite.setPosition(item.x, item.y);
    }
    this.emitSnapshot(true);
  }

  private emitSnapshot(force = false): void {
    this.elapsedSinceStart += this.game.loop.delta;
    if (!force && this.elapsedSinceStart < 100) return;
    this.elapsedSinceStart = 0;
    this.onSnapshot(this.simulation.snapshot());
  }
}

export class LowWaterGame {
  private readonly game: Phaser.Game;
  private scene: LowWaterScene | null = null;

  constructor(options: LowWaterGameOptions) {
    this.scene = new LowWaterScene({ onSnapshot: options.onSnapshot, onReady: options.onReady, onPlayerState: options.onPlayerState });
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: options.parent,
      width: 960,
      height: 640,
      backgroundColor: "#3c4a4d",
      scene: this.scene,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, pixelArt: false, roundPixels: true },
      input: { activePointers: 2 },
    });
  }

  destroy(): void {
    this.scene = null;
    this.game.destroy(true);
  }
}
