import test from "node:test";
import assert from "node:assert/strict";
import {
  clampThrottle,
  normalizeControlInput,
} from "../../src/features/parking-contract/input-guard.ts";

test("UG-s04: throttle is clamped into [-1, 1]", () => {
  assert.equal(clampThrottle(1.4), 1);
  assert.equal(clampThrottle(-1.2), -1);
  assert.equal(clampThrottle(0.3), 0.3);
});

test("UG-s04: invalid direction is rejected", () => {
  const normalized = normalizeControlInput({
    direction: "invalid",
    throttle: 0.5,
  });

  assert.equal(normalized, null);
});

test("UG-s04: non-finite throttle falls back to 0", () => {
  const normalized = normalizeControlInput({
    direction: "straight",
    throttle: Number.NaN,
  });

  assert.deepEqual(normalized, {
    direction: "straight",
    throttle: 0,
  });
});
