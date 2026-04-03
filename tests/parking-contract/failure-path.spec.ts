import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page.ts";

test("FP-s01: finishing without success hint returns failure placeholder", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  page.handleButtonControl({ direction: "straight", throttle: 0.2 });

  page.clickFinish();
  const state = page.getViewState();

  assert.equal(state.phase, "DONE");
  assert.equal(state.resultText, "FAILURE_PLACEHOLDER");
});

test("FP-s01: invalid scenario selection is ignored", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  const before = page.getViewState();

  page.selectScenario("invalid-scenario");
  const after = page.getViewState();

  assert.equal(after.selectedScenario, before.selectedScenario);
  assert.equal(after.renderReady, true);
  assert.deepEqual(after.renderedScene, before.renderedScene);
});
