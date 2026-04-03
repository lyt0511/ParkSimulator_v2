import { createPlayPageModel } from "./play-page.ts";

function printSnapshot(label, state) {
  const visibleLayers =
    state.renderedScene?.layers.filter((layer) => layer.visible).map((layer) => layer.layerId) ?? [];

  console.log(`[demo] ${label}`, {
    phase: state.phase,
    selectedScenario: state.selectedScenario,
    renderReady: state.renderReady,
    visibleLayers,
    lastControl: state.lastControl,
    ego: {
      x: Number(state.ego.x.toFixed(2)),
      y: Number(state.ego.y.toFixed(2)),
      angle: Number(state.ego.angle.toFixed(3)),
    },
    resultText: state.resultText,
    resultReason: state.resultReason,
    settleSpeed: state.settleSpeed,
  });
}

const page = createPlayPageModel();

printSnapshot("initial", page.getViewState());

page.selectScenario("normal-reverse-parking");
printSnapshot("after-select-ready", page.getViewState());

for (let i = 0; i < 29; i += 1) {
  page.handleKeyboardControl({ direction: "straight", throttle: 0.5 });
}
page.handleKeyboardControl({ direction: "straight", throttle: 0.05 });
printSnapshot("after-driving", page.getViewState());

page.clickFinish();
printSnapshot("after-finish-done", page.getViewState());

page.clickRetry();
printSnapshot("after-retry-ready", page.getViewState());

page.clickBackToScenarioSelect();
printSnapshot("after-back-idle", page.getViewState());
