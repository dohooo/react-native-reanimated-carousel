---
"react-native-reanimated-carousel": patch
---

- Clamp visible ranges during non-loop overdrag so the first item stays visible when dragging right at page start (PR #872).
- Add regression test coverage for non-loop overdrag boundary behavior (PR #872).
