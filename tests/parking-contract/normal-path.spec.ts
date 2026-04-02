import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page";

test("NP-s01: normal reverse parking minimal loop reaches DONE", () => {
  const page = createPlayPageModel();

  page.selectScenario("normal-reverse-parking");
  assert.equal(page.getViewState().phase, "READY");

  page.handleKeyboardControl({ direction: "left", throttle: 0.5 });
  assert.equal(page.getViewState().phase, "RUNNING");

  page.clickFinish({ successHint: true });
  const state = page.getViewState();

  assert.equal(state.phase, "DONE");
  assert.equal(state.resultText, "SUCCESS_PLACEHOLDER");
});
