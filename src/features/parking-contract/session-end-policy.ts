import type {
  ControlInput,
  EgoPose,
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
}

export type SessionEndResult = SessionClassification;

export function resolveSessionEnd(input: SessionEndInput): SessionEndResult {
  return classifySessionResult({
    scenarioId: input.scenarioId,
    ego: input.ego,
    lastControl: input.lastControl,
  });
}
