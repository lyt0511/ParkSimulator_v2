import {
  DEFAULT_EGO_POSE,
  EGO_BOUNDS,
  EGO_SPEED_SCALE,
  EGO_STEER_STEP,
  SCENARIOS,
  type ControlInput,
  type EgoPose,
  type ScenarioId,
  type SessionPhase,
} from "./features/parking-contract/contract-constants.ts";
import { normalizeControlInput } from "./features/parking-contract/input-guard.ts";
import {
  resolveSessionEnd,
  type SessionEndResult,
} from "./features/parking-contract/session-end-policy.ts";
import type { RenderedScene } from "./scene-renderer.ts";

export interface SessionViewState {
  phase: SessionPhase;
  selectedScenario: ScenarioId | null;
  renderedScene: RenderedScene | null;
  renderReady: boolean;
  lastControl: ControlInput | null;
  resultText: string | null;
  resultReason: string | null;
  settleSpeed: number | null;
  maxAllowedSpeed: number | null;
  ego: EgoPose;
}

function clamp(value: number, min: number, max: number): number {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}

function cloneEgoPose(ego: EgoPose): EgoPose {
  return {
    x: ego.x,
    y: ego.y,
    angle: ego.angle,
  };
}

export class SessionController {
  private phase: SessionPhase = "IDLE";
  private selectedScenario: ScenarioId | null = null;
  private renderedScene: RenderedScene | null = null;
  private renderReady = false;
  private lastControl: ControlInput | null = null;
  private settlement: SessionEndResult | null = null;
  private ego: EgoPose = cloneEgoPose(DEFAULT_EGO_POSE);

  selectScenario(scenario: ScenarioId): void {
    if (!SCENARIOS.includes(scenario)) {
      return;
    }

    this.selectedScenario = scenario;
    this.phase = "READY";
    this.renderedScene = null;
    this.renderReady = false;
    this.lastControl = null;
    this.settlement = null;
    this.resetEgo();
  }

  setRenderedScene(renderedScene: RenderedScene): void {
    if (this.selectedScenario !== renderedScene.scenarioId) {
      return;
    }

    this.renderedScene = renderedScene;
    this.renderReady = true;
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
    this.advanceEgo(normalized);
  }

  finishSession(): void {
    if (this.phase !== "RUNNING" || !this.selectedScenario) {
      return;
    }

    this.phase = "SETTLING";
    this.settlement = resolveSessionEnd({
      scenarioId: this.selectedScenario,
      ego: cloneEgoPose(this.ego),
      lastControl: this.lastControl,
    });
    this.phase = "DONE";
  }

  retrySession(): void {
    if (!this.selectedScenario || this.phase !== "DONE") {
      return;
    }

    this.phase = "READY";
    this.lastControl = null;
    this.settlement = null;
    this.resetEgo();
  }

  backToScenarioSelect(): void {
    if (this.phase !== "DONE" && this.phase !== "READY") {
      return;
    }

    this.phase = "IDLE";
    this.selectedScenario = null;
    this.renderedScene = null;
    this.renderReady = false;
    this.lastControl = null;
    this.settlement = null;
    this.resetEgo();
  }

  getEgoPose(): EgoPose {
    return cloneEgoPose(this.ego);
  }

  getViewState(): SessionViewState {
    return {
      phase: this.phase,
      selectedScenario: this.selectedScenario,
      renderedScene: this.renderedScene,
      renderReady: this.renderReady,
      lastControl: this.lastControl,
      resultText: this.settlement?.resultText ?? null,
      resultReason: this.settlement?.reason ?? null,
      settleSpeed: this.settlement?.speed ?? null,
      maxAllowedSpeed: this.settlement?.maxAllowedSpeed ?? null,
      ego: cloneEgoPose(this.ego),
    };
  }

  private resetEgo(): void {
    this.ego = cloneEgoPose(DEFAULT_EGO_POSE);
  }

  private advanceEgo(control: ControlInput): void {
    const steerDelta =
      control.direction === "left"
        ? -EGO_STEER_STEP
        : control.direction === "right"
          ? EGO_STEER_STEP
          : 0;
    this.ego.angle += steerDelta;

    const speed = control.throttle * EGO_SPEED_SCALE;
    this.ego.x += Math.cos(this.ego.angle) * speed;
    this.ego.y += Math.sin(this.ego.angle) * speed;
    this.ego.x = clamp(this.ego.x, EGO_BOUNDS.minX, EGO_BOUNDS.maxX);
    this.ego.y = clamp(this.ego.y, EGO_BOUNDS.minY, EGO_BOUNDS.maxY);
  }
}
