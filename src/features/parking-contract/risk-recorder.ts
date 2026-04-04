import type { EgoPose, RuntimeRisk, ScenarioId } from "./contract-constants.ts";
import { EGO_BOUNDS, SESSION_TIMEOUT_TICKS } from "./contract-constants.ts";

interface RuntimeRiskInput {
  scenarioId: ScenarioId;
  ego: EgoPose;
  elapsedTicks: number;
}

const STATIC_CAR_BOXES: Record<ScenarioId, Array<{ minX: number; maxX: number; minY: number; maxY: number }>> = {
  "normal-reverse-parking": [
    { minX: 150, maxX: 230, minY: 228, maxY: 262 },
    { minX: 450, maxX: 530, minY: 228, maxY: 262 },
  ],
  "normal-parallel-parking": [
    { minX: 250, maxX: 330, minY: 168, maxY: 202 },
    { minX: 250, maxX: 330, minY: 278, maxY: 312 },
  ],
  "narrow-reverse-parking": [
    { minX: 260, maxX: 330, minY: 232, maxY: 264 },
    { minX: 400, maxX: 470, minY: 232, maxY: 264 },
  ],
  "narrow-parallel-parking": [
    { minX: 470, maxX: 540, minY: 170, maxY: 204 },
    { minX: 470, maxX: 540, minY: 280, maxY: 314 },
  ],
};

function insideBox(ego: EgoPose, box: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
  return ego.x >= box.minX && ego.x <= box.maxX && ego.y >= box.minY && ego.y <= box.maxY;
}

function detectCollision(scenarioId: ScenarioId, ego: EgoPose): boolean {
  const boxes = STATIC_CAR_BOXES[scenarioId];
  return boxes.some((box) => insideBox(ego, box));
}

function detectLaneViolation(ego: EgoPose): boolean {
  return ego.x === EGO_BOUNDS.minX || ego.x === EGO_BOUNDS.maxX || ego.y === EGO_BOUNDS.minY || ego.y === EGO_BOUNDS.maxY;
}

export function detectRuntimeRisks(input: RuntimeRiskInput): RuntimeRisk[] {
  const risks = new Set<RuntimeRisk>();

  if (detectCollision(input.scenarioId, input.ego)) {
    risks.add("COLLISION");
  }
  if (detectLaneViolation(input.ego)) {
    risks.add("LANE_VIOLATION");
  }
  if (input.elapsedTicks >= SESSION_TIMEOUT_TICKS) {
    risks.add("TIMEOUT");
  }

  return [...risks];
}

export function latchRisks(existing: RuntimeRisk[], detected: RuntimeRisk[]): RuntimeRisk[] {
  return [...new Set([...existing, ...detected])];
}
