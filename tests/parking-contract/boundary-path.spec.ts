import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page.ts";

test("BP-s01: throttle is clamped and invalid direction is ignored", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  page.handleKeyboardControl({ direction: "left", throttle: 1.3 });
  let state = page.getViewState();
  assert.equal(state.phase, "RUNNING");
  assert.equal(state.lastControl?.throttle, 1);

  page.handleKeyboardControl({ direction: "invalid", throttle: -1.7 });
  state = page.getViewState();
  assert.equal(state.lastControl?.direction, "left");
  assert.equal(state.lastControl?.throttle, 1);
});

test("BP-s01: selecting the same scenario twice keeps a single ordered layer stack", () => {
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
