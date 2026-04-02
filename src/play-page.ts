import { SessionController } from "./session-controller";
import type { ScenarioId } from "./features/parking-contract/contract-constants";

export interface PlayPageModel {
  selectScenario: (scenario: ScenarioId) => void;
  handleKeyboardControl: (input: { direction: string; throttle: number }) => void;
  handleButtonControl: (input: { direction: string; throttle: number }) => void;
  clickFinish: (options?: { successHint?: boolean }) => void;
  getViewState: () => ReturnType<SessionController["getViewState"]>;
}

export function createPlayPageModel(): PlayPageModel {
  const controller = new SessionController();

  return {
    selectScenario: (scenario) => controller.selectScenario(scenario),
    handleKeyboardControl: (input) => controller.applyControl(input),
    handleButtonControl: (input) => controller.applyControl(input),
    clickFinish: (options) => controller.finishSession(options),
    getViewState: () => controller.getViewState(),
  };
}
