export type SessionPhase = "IDLE" | "READY" | "RUNNING" | "SETTLING" | "DONE";

export type DirectionInput = "left" | "right" | "straight";

export interface ControlInput {
  direction: DirectionInput;
  throttle: number;
}

export const TICK_HZ = 20;
export const MIN_THROTTLE = -1;
export const MAX_THROTTLE = 1;

export const SCENARIOS = ["normal-reverse-parking"] as const;
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
}

export const SCENE_RENDER_TOKENS: SceneRenderTokens = {
  background: "#edf1f5",
  road: "#1b1b1b",
  laneMarkings: "#ffffff",
  parkingSlots: "#d9d9d9",
  greenbelt: "#2f8f46",
  staticCars: "#8ea0ad",
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
