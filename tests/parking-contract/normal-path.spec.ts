import test from "node:test";
import assert from "node:assert/strict";
import { createPlayPageModel } from "../../src/play-page.ts";

function driveIntoSlot(page: ReturnType<typeof createPlayPageModel>, finalThrottle: number): void {
  for (let i = 0; i < 29; i += 1) {
    page.handleButtonControl({ direction: "straight", throttle: 0.5 });
  }

  page.handleButtonControl({ direction: "straight", throttle: finalThrottle });
}

test("NP-s03: settle success after finish, then retry and return to scenario select", () => {
  const page = createPlayPageModel();

  page.selectScenario("normal-reverse-parking");
  const readyState = page.getViewState();

  assert.equal(readyState.phase, "READY");
  assert.equal(readyState.renderReady, true);

  driveIntoSlot(page, 0.05);
  const runningState = page.getViewState();
  assert.equal(runningState.phase, "RUNNING");

  page.clickFinish();
  const doneState = page.getViewState();

  assert.equal(doneState.phase, "DONE");
  assert.equal(doneState.resultReason, "PARKED");
  assert.match(doneState.resultText ?? "", /^SUCCESS:/);
  assert.equal(doneState.settleSpeed, 0.05);

  const donePose = doneState.ego;
  page.handleKeyboardControl({ direction: "left", throttle: 1 });
  assert.deepEqual(page.getViewState().ego, donePose);

  page.clickRetry();
  const retryState = page.getViewState();
  assert.equal(retryState.phase, "READY");
  assert.equal(retryState.resultText, null);
  assert.deepEqual(retryState.latchedRisks, []);
  assert.equal(retryState.elapsedTicks, 0);
  assert.deepEqual(retryState.ego, { x: 360, y: 340, angle: -Math.PI / 2 });

  page.clickBackToScenarioSelect();
  const backState = page.getViewState();
  assert.equal(backState.phase, "IDLE");
  assert.equal(backState.selectedScenario, null);
  assert.equal(backState.renderReady, false);
  assert.equal(backState.renderedScene, null);
});
