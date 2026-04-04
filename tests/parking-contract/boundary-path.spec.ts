import test from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS } from "../../src/features/parking-contract/contract-constants.ts";
import { createPlayPageModel } from "../../src/play-page.ts";

function driveIntoSlot(page: ReturnType<typeof createPlayPageModel>, finalThrottle: number): void {
  for (let i = 0; i < 29; i += 1) {
    page.handleKeyboardControl({ direction: "straight", throttle: 0.5 });
  }

  page.handleKeyboardControl({ direction: "straight", throttle: finalThrottle });
}

test("BP-s03: finish speed at 0.05 is accepted", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  driveIntoSlot(page, 0.05);
  page.clickFinish();

  const state = page.getViewState();
  assert.equal(state.phase, "DONE");
  assert.equal(state.resultReason, "PARKED");
  assert.match(state.resultText ?? "", /^SUCCESS:/);
  assert.equal(state.settleSpeed, 0.05);
});

test("BP-s03: finish speed at 0.051 is rejected", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  driveIntoSlot(page, 0.051);
  page.clickFinish();

  const state = page.getViewState();
  assert.equal(state.phase, "DONE");
  assert.equal(state.resultReason, "SPEED_TOO_HIGH");
  assert.match(state.resultText ?? "", /^FAILURE: speed too high/);
  assert.equal(state.settleSpeed, 0.051);
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

test("BP-s05: each scenario has a distinguishable render geometry signature", () => {
  const page = createPlayPageModel();
  const signatures = new Set<string>();

  for (const scenarioId of SCENARIOS) {
    page.selectScenario(scenarioId);
    const rendered = page.getViewState().renderedScene;
    assert.ok(rendered);

    const signature = rendered.layers
      .map((layer) => `${layer.layerId}:${layer.elements.join(",")}`)
      .join("|");
    signatures.add(signature);
  }

  assert.equal(signatures.size, SCENARIOS.length);
});

test("BP-s04: out-of-range throttle is clamped without breaking session", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  page.handleKeyboardControl({ direction: "straight", throttle: 1.4 });
  const high = page.getViewState();
  assert.equal(high.phase, "RUNNING");
  assert.equal(high.lastControl?.throttle, 1);

  page.handleKeyboardControl({ direction: "straight", throttle: -1.2 });
  const low = page.getViewState();
  assert.equal(low.phase, "RUNNING");
  assert.equal(low.lastControl?.throttle, -1);
});
