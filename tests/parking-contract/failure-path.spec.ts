import test from "node:test";
import assert from "node:assert/strict";
import { SESSION_TIMEOUT_TICKS } from "../../src/features/parking-contract/contract-constants.ts";
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

test("FP-s04: timeout auto-finishes session and reports timeout failure", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  for (let i = 0; i < SESSION_TIMEOUT_TICKS; i += 1) {
    page.handleButtonControl({ direction: "straight", throttle: 0 });
  }

  const state = page.getViewState();
  assert.equal(state.phase, "DONE");
  assert.equal(state.resultReason, "TIMEOUT");
  assert.ok(state.latchedRisks.includes("TIMEOUT"));
  assert.match(state.resultText ?? "", /^FAILURE: session timed out/);
});

test("FP-s04: lane violation risk stays latched and drives settlement result", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");

  for (let i = 0; i < 45; i += 1) {
    page.handleKeyboardControl({ direction: "straight", throttle: 1 });
  }

  const atBoundary = page.getViewState();
  assert.ok(atBoundary.latchedRisks.includes("LANE_VIOLATION"));

  page.handleKeyboardControl({ direction: "straight", throttle: -1 });
  const movedAway = page.getViewState();
  assert.ok(movedAway.ego.y > 70);
  assert.ok(movedAway.latchedRisks.includes("LANE_VIOLATION"));

  page.clickFinish();
  const doneState = page.getViewState();
  assert.equal(doneState.phase, "DONE");
  assert.equal(doneState.resultReason, "LANE_VIOLATION");
});
