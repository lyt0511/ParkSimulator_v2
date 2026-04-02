import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page";

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
