---
"react-native-reanimated-carousel": patch
---

- Fix non-loop `scrollTo()` so backward jumps keep the correct negative offset instead of briefly rendering a blank frame.
- Add regression tests for non-loop backward `scrollTo()` and returning to index `0`.
