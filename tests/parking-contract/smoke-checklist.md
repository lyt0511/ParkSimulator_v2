# Slice s05 Smoke Checklist

## Preconditions
- Use any scenario from:
  - `normal-reverse-parking`
  - `normal-parallel-parking`
  - `narrow-reverse-parking`
  - `narrow-parallel-parking`
- Session starts from `IDLE`.

## Checks
1. Enter practice page and select each scenario once.
   - Expected: phase becomes `READY`, `renderReady=true`, and scene geometry is visibly different across scenarios.
2. Trigger first valid control input in each scenario.
   - Expected: phase moves to `RUNNING` and ego car remains visible.
3. Finish one round with speed `0.05` in each scenario.
   - Expected: phase reaches `DONE` and result can show success path.
4. Verify one boundary case with speed `0.051`.
   - Expected: result shows failure with speed-threshold reason.
5. Verify one failure case (collision/lane violation/timeout).
   - Expected: result shows failure and corresponding reason.
6. Switch to another scenario from `DONE` and continue.
   - Expected: phase returns to `READY` and the new scenario can start and settle.

## Settlement Focus
- Four scenarios are all playable end-to-end.
- Render distinction + interaction + settlement remain consistent per scenario.
