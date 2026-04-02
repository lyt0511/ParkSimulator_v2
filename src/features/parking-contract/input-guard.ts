import {
  MAX_THROTTLE,
  MIN_THROTTLE,
  type ControlInput,
  type DirectionInput,
} from "./contract-constants";

const DIRECTION_SET = new Set<DirectionInput>(["left", "right", "straight"]);

export function clampThrottle(value: number): number {
  if (value > MAX_THROTTLE) return MAX_THROTTLE;
  if (value < MIN_THROTTLE) return MIN_THROTTLE;
  return value;
}

export function isDirectionInput(value: string): value is DirectionInput {
  return DIRECTION_SET.has(value as DirectionInput);
}

export function normalizeControlInput(input: {
  direction: string;
  throttle: number;
}): ControlInput | null {
  if (!isDirectionInput(input.direction)) {
    return null;
  }

  return {
    direction: input.direction,
    throttle: clampThrottle(input.throttle),
  };
}
