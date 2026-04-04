export type SessionPhase = "IDLE" | "READY" | "RUNNING" | "SETTLING" | "DONE";

export type DirectionInput = "left" | "right" | "straight";

export interface ControlInput {
  direction: DirectionInput;
  throttle: number;
}

export type RuntimeRisk = "COLLISION" | "LANE_VIOLATION" | "TIMEOUT";

export interface EgoPose {
  x: number;
  y: number;
  angle: number;
}

export const TICK_HZ = 20;
export const MIN_THROTTLE = -1;
export const MAX_THROTTLE = 1;
export const EGO_STEER_STEP = 0.08;
export const EGO_SPEED_SCALE = 6;
export const SESSION_TIMEOUT_TICKS = 120;
export const EGO_BOUNDS = {
  minX: 100,
  maxX: 620,
  minY: 70,
  maxY: 360,
} as const;
export const DEFAULT_EGO_POSE: EgoPose = {
  x: 360,
  y: 340,
  angle: -Math.PI / 2,
};

export const SCENARIOS = [
  "normal-reverse-parking",
  "normal-parallel-parking",
  "narrow-reverse-parking",
  "narrow-parallel-parking",
] as const;
export type ScenarioId = (typeof SCENARIOS)[number];

export function isScenarioId(value: string): value is ScenarioId {
  return (SCENARIOS as readonly string[]).includes(value);
}

export type SceneLayerId =
  | "background"
  | "road"
  | "laneMarkings"
  | "parkingSlots"
  | "decorations"
  | "staticCars"
  | "egoCar"
  | "HUDOverlay";

export const SCENE_LAYER_ORDER: SceneLayerId[] = [
  "background",
  "road",
  "laneMarkings",
  "parkingSlots",
  "decorations",
  "staticCars",
  "egoCar",
  "HUDOverlay",
];

export interface SceneRenderTokens {
  background: string;
  road: string;
  laneMarkings: string;
  parkingSlots: string;
  greenbelt: string;
  staticCars: string;
  egoBody: string;
  egoHead: string;
  egoWheel: string;
}

export const SCENE_RENDER_TOKENS: SceneRenderTokens = {
  background: "#edf1f5",
  road: "#1b1b1b",
  laneMarkings: "#ffffff",
  parkingSlots: "#d9d9d9",
  greenbelt: "#2f8f46",
  staticCars: "#8ea0ad",
  egoBody: "#c53030",
  egoHead: "#742a2a",
  egoWheel: "#1a202c",
};

export interface SceneGeometrySpec {
  road: string[];
  laneMarkings: string[];
  parkingSlots: string[];
  greenbelt: string[];
  staticCars: string[];
}

export interface SceneRenderSpec {
  scenarioId: ScenarioId;
  geometry: SceneGeometrySpec;
}

export const PLACEHOLDER_RESULT = {
  success: "SUCCESS_PLACEHOLDER",
  failure: "FAILURE_PLACEHOLDER",
} as const;
