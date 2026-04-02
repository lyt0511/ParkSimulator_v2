# Slice s01 Smoke Checklist

## Preconditions
- Use scenario `normal-reverse-parking`.
- Session starts from `IDLE`.

## Checks
1. Enter practice page and select `normal-reverse-parking`.
   - Expected: phase changes to `READY`.
2. Trigger first valid control input.
   - Expected: phase changes to `RUNNING`.
3. Apply keyboard-style control (`direction=left`, `throttle=0.5`).
   - Expected: input accepted and normalized.
4. Apply button-style control (`direction=straight`, `throttle=-0.2`).
   - Expected: input accepted and normalized.
5. Click finish.
   - Expected: phase reaches `DONE` and placeholder result text is visible.

## Placeholder Result
- Success text: `SUCCESS_PLACEHOLDER`
- Failure text: `FAILURE_PLACEHOLDER`
