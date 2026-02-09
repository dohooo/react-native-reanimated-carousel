---
"react-native-reanimated-carousel": patch
---

- Fix non-loop overscroll direction so tiny positive offsets at the first page no longer wrap to the last page (PR #871).
- Add integration tests for `next()` and `scrollTo()` boundary behavior (PR #871).
