---
"react-native-reanimated-carousel": patch
---

- Avoid the React 19 `element.ref` warning on web by removing the internal gesture child ref (Issue #857).
- Preserve horizontal and vertical non-loop boundaries with layout-derived container dimensions.
