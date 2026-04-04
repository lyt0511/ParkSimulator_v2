import type {
  ControlInput,
  EgoPose,
  ScenarioId,
} from "./contract-constants.ts";

export type SettlementReason =
  | "PARKED"
  | "NOT_IN_SLOT"
  | "BAD_HEADING"
  | "SPEED_TOO_HIGH"
  | "COLLISION"
  | "LANE_VIOLATION"
  | "TIMEOUT";

export interface SessionClassificationInput {
  scenarioId: ScenarioId;
  ego: EgoPose;
  lastControl: ControlInput | null;
}

export interface SessionClassification {
  success: boolean;
  reason: SettlementReason;
  speed: number;
  maxAllowedSpeed: number;
  resultText: string;
}

const FINISH_MAX_SPEED = 0.05;
const HEADING_TARGET = -Math.PI / 2;
const HEADING_TOLERANCE = 0.25;

const SLOT_ZONE_BY_SCENARIO: Record<ScenarioId, { minX: number; maxX: number; minY: number; maxY: number }> = {
  "normal-reverse-parking": {
    minX: 280,
    maxX: 400,
    minY: 210,
    maxY: 290,
  },
  "normal-parallel-parking": {
    minX: 300,
    maxX: 420,
    minY: 230,
    maxY: 300,
  },
  "narrow-reverse-parking": {
    minX: 320,
    maxX: 390,
    minY: 220,
    maxY: 285,
  },
  "narrow-parallel-parking": {
    minX: 300,
    maxX: 390,
    minY: 215,
    maxY: 275,
  },
};

function normalizeAngle(angle: number): number {
  let normalized = angle;
  while (normalized <= -Math.PI) normalized += Math.PI * 2;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  return normalized;
}

function inSlotZone(scenarioId: ScenarioId, ego: EgoPose): boolean {
  const zone = SLOT_ZONE_BY_SCENARIO[scenarioId];
  return ego.x >= zone.minX && ego.x <= zone.maxX && ego.y >= zone.minY && ego.y <= zone.maxY;
}

function headingOk(ego: EgoPose): boolean {
  const delta = normalizeAngle(ego.angle - HEADING_TARGET);
  return Math.abs(delta) <= HEADING_TOLERANCE;
}

function resolveReason(input: SessionClassificationInput, speed: number): SettlementReason {
  if (!inSlotZone(input.scenarioId, input.ego)) {
    return "NOT_IN_SLOT";
  }

  if (!headingOk(input.ego)) {
    return "BAD_HEADING";
  }

  if (speed > FINISH_MAX_SPEED) {
    return "SPEED_TOO_HIGH";
  }

  return "PARKED";
}

function toResultText(reason: SettlementReason, speed: number): string {
  if (reason === "PARKED") {
    return `SUCCESS: parked and stable (speed=${speed.toFixed(3)} <= ${FINISH_MAX_SPEED.toFixed(3)})`;
  }

  if (reason === "SPEED_TOO_HIGH") {
    return `FAILURE: speed too high (speed=${speed.toFixed(3)} > ${FINISH_MAX_SPEED.toFixed(3)})`;
  }

  if (reason === "BAD_HEADING") {
    return "FAILURE: heading not aligned with parking slot";
  }

  return "FAILURE: ego car is not inside parking slot";
}

export function classifySessionResult(input: SessionClassificationInput): SessionClassification {
  const speed = Math.abs(input.lastControl?.throttle ?? 0);
  const reason = resolveReason(input, speed);

  return {
    success: reason === "PARKED",
    reason,
    speed,
    maxAllowedSpeed: FINISH_MAX_SPEED,
    resultText: toResultText(reason, speed),
  };
}
