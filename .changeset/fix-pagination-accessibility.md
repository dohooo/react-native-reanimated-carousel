---
"react-native-reanimated-carousel": patch
---

- Fix pagination selected-state syncing via `scheduleOnRN` instead of render-time reads from reanimated values (PR #866).
- Add tests to prevent accessibility regressions and warning noise (PR #866).
