import { isScenarioId } from "./features/parking-contract/contract-constants.ts";
import { loadSceneRenderSpec } from "./scene-loader.ts";
import { renderScene } from "./scene-renderer.ts";
import { SessionController } from "./session-controller.ts";

export interface PlayPageModel {
  selectScenario: (scenario: string) => void;
  handleKeyboardControl: (input: { direction: string; throttle: number }) => void;
  handleButtonControl: (input: { direction: string; throttle: number }) => void;
  clickFinish: () => void;
  clickRetry: () => void;
  clickBackToScenarioSelect: () => void;
  getViewState: () => ReturnType<SessionController["getViewState"]>;
}

export function createPlayPageModel(): PlayPageModel {
  const controller = new SessionController();
  let loadedSceneSpec: ReturnType<typeof loadSceneRenderSpec> = null;

  const syncRenderedScene = (): void => {
    if (!loadedSceneSpec) {
      return;
    }

    const viewState = controller.getViewState();
    controller.setRenderedScene(
      renderScene(loadedSceneSpec, {
        egoPose: controller.getEgoPose(),
        showEgoCar: viewState.phase === "RUNNING" || viewState.phase === "SETTLING" || viewState.phase === "DONE",
      }),
    );
  };

  const dispatchControl = (input: { direction: string; throttle: number }): void => {
    controller.applyControl(input);
    syncRenderedScene();
  };

  return {
    selectScenario: (scenario) => {
      if (!isScenarioId(scenario)) {
        return;
      }

      controller.selectScenario(scenario);
      loadedSceneSpec = loadSceneRenderSpec(scenario);
      if (!loadedSceneSpec) {
        return;
      }

      syncRenderedScene();
    },
    handleKeyboardControl: (input) => dispatchControl(input),
    handleButtonControl: (input) => dispatchControl(input),
    clickFinish: () => {
      controller.finishSession();
      syncRenderedScene();
    },
    clickRetry: () => {
      controller.retrySession();
      syncRenderedScene();
    },
    clickBackToScenarioSelect: () => {
      controller.backToScenarioSelect();
      loadedSceneSpec = null;
    },
    getViewState: () => controller.getViewState(),
  };
}
