import { describe, expect, it } from "vitest";
import { LowWaterSimulation } from "./simulation";

describe("LowWaterSimulation", () => {
  it("starts a run and collects a find when the mudlark reaches it", () => {
    const simulation = new LowWaterSimulation();
    const target = simulation.loot[12];

    simulation.player.x = target.x;
    simulation.player.y = target.y;
    simulation.move(0, 0, 0.01);

    const snapshot = simulation.snapshot();
    expect(snapshot.phase).toBe("running");
    expect(snapshot.collected).toBe(1);
    expect(snapshot.carriedValue).toBe(target.value);
    expect(snapshot.totalFinds).toBe(1);
  });

  it("banks a combo-adjusted haul and reduces risk", () => {
    const simulation = new LowWaterSimulation();
    const target = simulation.loot[12];

    simulation.player.x = target.x;
    simulation.player.y = target.y;
    simulation.move(0, 0, 0.01);
    const before = simulation.snapshot();

    simulation.bank();
    const after = simulation.snapshot();

    expect(after.carriedValue).toBe(0);
    expect(after.bankedValue).toBeGreaterThanOrEqual(before.carriedValue);
    expect(after.risk).toBeLessThan(before.risk);
  });

  it("allows at most two tide pushes", () => {
    const simulation = new LowWaterSimulation();
    simulation.start();

    simulation.pushTide();
    const first = simulation.snapshot();
    simulation.pushTide();
    const second = simulation.snapshot();
    simulation.pushTide();
    const capped = simulation.snapshot();

    expect(first.wave).toBe(4);
    expect(second.wave).toBe(5);
    expect(capped.wave).toBe(second.wave);
    expect(capped.elapsed).toBe(second.elapsed);
  });

  it("ends safely when the crew extracts", () => {
    const simulation = new LowWaterSimulation();
    const target = simulation.loot[12];

    simulation.player.x = target.x;
    simulation.player.y = target.y;
    simulation.move(0, 0, 0.01);
    simulation.extract();

    const snapshot = simulation.snapshot();
    expect(snapshot.phase).toBe("extracted");
    expect(snapshot.carriedValue).toBe(0);
    expect(snapshot.bankedValue).toBeGreaterThan(0);
  });
});
