import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page";

test("FP-s01: finishing without success hint returns failure placeholder", () => {
  const page = createPlayPageModel();
  page.selectScenario("normal-reverse-parking");
  page.handleButtonControl({ direction: "straight", throttle: 0.2 });

  page.clickFinish();
  const state = page.getViewState();

  assert.equal(state.phase, "DONE");
  assert.equal(state.resultText, "FAILURE_PLACEHOLDER");
});
