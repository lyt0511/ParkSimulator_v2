import {
  PLACEHOLDER_RESULT,
  SCENARIOS,
  type ControlInput,
  type ScenarioId,
  type SessionPhase,
} from "./features/parking-contract/contract-constants";
import { normalizeControlInput } from "./features/parking-contract/input-guard";

export interface SessionViewState {
  phase: SessionPhase;
  selectedScenario: ScenarioId | null;
  lastControl: ControlInput | null;
  resultText: string | null;
}

export class SessionController {
  private phase: SessionPhase = "IDLE";
  private selectedScenario: ScenarioId | null = null;
  private lastControl: ControlInput | null = null;
  private resultText: string | null = null;

  selectScenario(scenario: ScenarioId): void {
    if (!SCENARIOS.includes(scenario)) {
      return;
    }
    this.selectedScenario = scenario;
    this.phase = "READY";
    this.resultText = null;
    this.lastControl = null;
  }

  applyControl(rawInput: { direction: string; throttle: number }): void {
    if (this.phase !== "READY" && this.phase !== "RUNNING") {
      return;
    }

    const normalized = normalizeControlInput(rawInput);
    if (!normalized) {
      return;
    }

    if (this.phase === "READY") {
      this.phase = "RUNNING";
    }

    this.lastControl = normalized;
  }

  finishSession(options?: { successHint?: boolean }): void {
    if (this.phase !== "RUNNING" && this.phase !== "READY") {
      return;
    }

    this.phase = "SETTLING";
    this.resultText = options?.successHint
      ? PLACEHOLDER_RESULT.success
      : PLACEHOLDER_RESULT.failure;
    this.phase = "DONE";
  }

  getViewState(): SessionViewState {
    return {
      phase: this.phase,
      selectedScenario: this.selectedScenario,
      lastControl: this.lastControl,
      resultText: this.resultText,
    };
  }
}
