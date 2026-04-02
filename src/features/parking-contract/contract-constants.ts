export type ScenarioId = "normal-reverse-parking";

export type SessionPhase = "IDLE" | "READY" | "RUNNING" | "SETTLING" | "DONE";

export type DirectionInput = "left" | "right" | "straight";

export interface ControlInput {
  direction: DirectionInput;
  throttle: number;
}

export const TICK_HZ = 20;
export const MIN_THROTTLE = -1;
export const MAX_THROTTLE = 1;

export const SCENARIOS: ScenarioId[] = ["normal-reverse-parking"];

export const PLACEHOLDER_RESULT = {
  success: "SUCCESS_PLACEHOLDER",
  failure: "FAILURE_PLACEHOLDER",
} as const;
