# Slice s03 Smoke Checklist

## Preconditions
- Use scenario `normal-reverse-parking`.
- Session starts from `IDLE`.

## Checks
1. Enter practice page and select `normal-reverse-parking`.
   - Expected: phase changes to `READY` and `renderReady=true`.
2. Trigger first valid control input.
   - Expected: phase changes to `RUNNING` and ego car becomes visible.
3. Drive into slot area and finish with speed `0.05`.
   - Expected: phase reaches `DONE` and result shows success.
4. Retry from done state.
   - Expected: phase returns to `READY`, ego pose resets, result is cleared.
5. Repeat finish with speed `0.051`.
   - Expected: result shows failure with speed-threshold reason.
6. Click back to scenario selection from `DONE` or `READY`.
   - Expected: phase returns to `IDLE`, selected scenario is cleared.

## Settlement Focus
- Boundary threshold: `0.05` succeeds, `0.051` fails.
- `DONE` state ignores control input until retry.
