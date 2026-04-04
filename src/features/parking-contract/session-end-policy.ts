import type {
  ControlInput,
  EgoPose,
  RuntimeRisk,
  ScenarioId,
} from "./contract-constants.ts";
import {
  classifySessionResult,
  type SessionClassification,
} from "./result-classifier.ts";

export interface SessionEndInput {
  scenarioId: ScenarioId;
  ego: EgoPose;
  lastControl: ControlInput | null;
  latchedRisks: RuntimeRisk[];
  timeoutTriggered: boolean;
}

export type SessionEndResult = SessionClassification;

function resolveRuntimeFailure(input: SessionEndInput): SessionEndResult | null {
  if (input.timeoutTriggered || input.latchedRisks.includes("TIMEOUT")) {
    return {
      success: false,
      reason: "TIMEOUT",
      speed: Math.abs(input.lastControl?.throttle ?? 0),
      maxAllowedSpeed: 0.05,
      resultText: "FAILURE: session timed out",
    };
  }

  if (input.latchedRisks.includes("COLLISION")) {
    return {
      success: false,
      reason: "COLLISION",
      speed: Math.abs(input.lastControl?.throttle ?? 0),
      maxAllowedSpeed: 0.05,
      resultText: "FAILURE: collision detected",
    };
  }

  if (input.latchedRisks.includes("LANE_VIOLATION")) {
    return {
      success: false,
      reason: "LANE_VIOLATION",
      speed: Math.abs(input.lastControl?.throttle ?? 0),
      maxAllowedSpeed: 0.05,
      resultText: "FAILURE: lane boundary violated",
    };
  }

  return null;
}

export function resolveSessionEnd(input: SessionEndInput): SessionEndResult {
  const runtimeFailure = resolveRuntimeFailure(input);
  if (runtimeFailure) {
    return runtimeFailure;
  }

  return classifySessionResult({
    scenarioId: input.scenarioId,
    ego: input.ego,
    lastControl: input.lastControl,
  });
}
