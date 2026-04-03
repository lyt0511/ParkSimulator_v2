import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page.ts";

test("FP-s03: finishing outside parking slot returns failure", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  page.handleButtonControl({ direction: "left", throttle: 0.2 });

  page.clickFinish();
  const state = page.getViewState();

  assert.equal(state.phase, "DONE");
  assert.equal(state.resultReason, "NOT_IN_SLOT");
  assert.match(state.resultText ?? "", /^FAILURE:/);
});

test("FP-s03: invalid scenario selection is ignored", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  const before = page.getViewState();

  page.selectScenario("invalid-scenario");
  const after = page.getViewState();

  assert.equal(after.selectedScenario, before.selectedScenario);
  assert.equal(after.renderReady, true);
  assert.deepEqual(after.renderedScene, before.renderedScene);
});

test("FP-s03: control input is ignored after DONE until retry", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  page.handleButtonControl({ direction: "straight", throttle: 0.2 });
  page.clickFinish();

  const doneState = page.getViewState();
  page.handleKeyboardControl({ direction: "right", throttle: 1 });

  const afterIgnoredInput = page.getViewState();
  assert.deepEqual(afterIgnoredInput.ego, doneState.ego);
  assert.equal(afterIgnoredInput.phase, "DONE");
});
