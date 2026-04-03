import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page.ts";

test("NP-s02: keyboard control moves ego car and exposes ego layer before finish", () => {
  const page = createPlayPageModel();

  page.selectScenario("normal-reverse-parking");
  const readyState = page.getViewState();

  assert.equal(readyState.phase, "READY");
  assert.equal(readyState.renderReady, true);
  assert.deepEqual(
    readyState.renderedScene?.layers
      .filter((layer) => layer.visible)
      .map((layer) => layer.layerId),
    ["background", "road", "laneMarkings", "parkingSlots", "decorations", "staticCars"],
  );
  assert.deepEqual(readyState.ego, { x: 360, y: 340, angle: -Math.PI / 2 });

  page.handleKeyboardControl({ direction: "left", throttle: 0.5 });
  const runningState = page.getViewState();
  assert.equal(runningState.phase, "RUNNING");
  assert.equal(runningState.lastControl?.direction, "left");
  assert.equal(runningState.lastControl?.throttle, 0.5);
  assert.notDeepEqual(runningState.ego, readyState.ego);

  const egoLayer = runningState.renderedScene?.layers.find((layer) => layer.layerId === "egoCar");
  assert.equal(egoLayer?.visible, true);
  assert.deepEqual(egoLayer?.elements.map((element) => element.split("@")[0]), [
    "ego-body",
    "ego-head",
    "ego-wheel-front-left",
    "ego-wheel-front-right",
    "ego-wheel-rear-left",
    "ego-wheel-rear-right",
  ]);

  page.clickFinish({ successHint: true });
  const state = page.getViewState();

  assert.equal(state.phase, "DONE");
  assert.equal(state.resultText, "SUCCESS_PLACEHOLDER");
});
