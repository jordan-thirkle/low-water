import { useEffect, useRef } from "react";
import type { RunSnapshot } from "../app/types";
import { LowWaterGame, type LowWaterGameController } from "../game/LowWaterGame";
import type { RemotePlayer } from "../lib/multiplayer";

interface GameCanvasProps {
  onSnapshot: (snapshot: RunSnapshot) => void;
  onReady: (controller: LowWaterGameController) => void;
  onPlayerState?: (player: Pick<RemotePlayer, "x" | "y">) => void;
}

export default function GameCanvas({ onSnapshot, onReady, onPlayerState }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const game = new LowWaterGame({ parent: hostRef.current, onSnapshot, onReady, onPlayerState });
    return () => game.destroy();
  }, [onPlayerState, onReady, onSnapshot]);

  return <div className="game-canvas-host" ref={hostRef} aria-label="Low Water playable salvage yard" />;
}
