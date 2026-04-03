import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page.ts";

test("BP-s02: throttle is clamped and invalid direction is ignored", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  const initialEgo = page.getViewState().ego;

  page.handleKeyboardControl({ direction: "left", throttle: 1.3 });
  let state = page.getViewState();
  assert.equal(state.phase, "RUNNING");
  assert.equal(state.lastControl?.throttle, 1);
  assert.notDeepEqual(state.ego, initialEgo);
  const poseAfterValidInput = state.ego;

  page.handleKeyboardControl({ direction: "invalid", throttle: -1.7 });
  state = page.getViewState();
  assert.equal(state.lastControl?.direction, "left");
  assert.equal(state.lastControl?.throttle, 1);
  assert.deepEqual(state.ego, poseAfterValidInput);
});

test("BP-s02: selecting the same scenario twice keeps a single ordered layer stack", () => {
  const page = createPlayPageModel();

  page.selectScenario("normal-reverse-parking");
  const firstRender = page.getViewState().renderedScene;

  page.selectScenario("normal-reverse-parking");
  const secondRender = page.getViewState().renderedScene;

  assert.equal(page.getViewState().renderReady, true);
  assert.equal(firstRender?.layers.length, secondRender?.layers.length);

  const layerIds = secondRender?.layers.map((layer) => layer.layerId) ?? [];
  assert.equal(new Set(layerIds).size, layerIds.length);
  assert.deepEqual(layerIds, [
    "background",
    "road",
    "laneMarkings",
    "parkingSlots",
    "decorations",
    "staticCars",
    "egoCar",
    "HUDOverlay",
  ]);
});

test("BP-s02: keyboard and button controls share the same dispatch path", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  page.handleKeyboardControl({ direction: "straight", throttle: 0.2 });
  const afterKeyboard = page.getViewState();

  page.handleButtonControl({ direction: "right", throttle: 0.4 });
  const afterButton = page.getViewState();

  assert.equal(afterKeyboard.phase, "RUNNING");
  assert.equal(afterButton.phase, "RUNNING");
  assert.equal(afterButton.lastControl?.direction, "right");
  assert.equal(afterButton.lastControl?.throttle, 0.4);
  assert.notDeepEqual(afterButton.ego, afterKeyboard.ego);
  const egoLayer = afterButton.renderedScene?.layers.find((layer) => layer.layerId === "egoCar");
  assert.equal(egoLayer?.visible, true);
});
