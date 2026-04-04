import test from "node:test";
import assert from "node:assert/strict";
import { SESSION_TIMEOUT_TICKS } from "../../src/features/parking-contract/contract-constants.ts";
import {
  detectRuntimeRisks,
  latchRisks,
} from "../../src/features/parking-contract/risk-recorder.ts";

test("RR-s04: timeout risk is emitted at threshold", () => {
  const risks = detectRuntimeRisks({
    scenarioId: "normal-reverse-parking",
    ego: { x: 360, y: 340, angle: 0 },
    elapsedTicks: SESSION_TIMEOUT_TICKS,
  });

  assert.ok(risks.includes("TIMEOUT"));
});

test("RR-s04: lane violation is emitted at clamped boundary", () => {
  const risks = detectRuntimeRisks({
    scenarioId: "normal-reverse-parking",
    ego: { x: 620, y: 200, angle: 0 },
    elapsedTicks: 1,
  });

  assert.ok(risks.includes("LANE_VIOLATION"));
});

test("RR-s04: latch keeps unique historical risks", () => {
  const next = latchRisks(["COLLISION"], ["COLLISION", "TIMEOUT"]);

  assert.deepEqual(next, ["COLLISION", "TIMEOUT"]);
});
