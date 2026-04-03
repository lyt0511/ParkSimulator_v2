# Slice s01 Smoke Checklist

## Preconditions
- Use scenario `normal-reverse-parking`.
- Session starts from `IDLE`.

## Checks
1. Enter practice page and select `normal-reverse-parking`.
   - Expected: phase changes to `READY` and `renderReady=true`.
2. Inspect visible semantic layers in canvas order.
   - Expected: `background -> road -> laneMarkings -> parkingSlots -> decorations -> staticCars`.
3. Trigger first valid control input.
   - Expected: phase changes to `RUNNING` and the latest control is normalized.
4. Re-select `normal-reverse-parking` while in session.
   - Expected: scene refreshes without duplicated layer IDs.
5. Click finish.
   - Expected: phase reaches `DONE` and placeholder result text is visible.
6. Select an invalid scenario ID.
   - Expected: current valid scene remains unchanged.

## Placeholder Result
- Success text: `SUCCESS_PLACEHOLDER`
- Failure text: `FAILURE_PLACEHOLDER`
