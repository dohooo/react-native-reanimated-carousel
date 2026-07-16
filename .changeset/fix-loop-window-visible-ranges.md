---
"react-native-reanimated-carousel": patch
---

- Keep every item rendered in loop mode when `windowSize` is equal to or greater than the data length (Issue #918).
- Add unit and Maestro regression coverage for small looped data sets.
