---
"react-native-reanimated-carousel": minor
---

- Deprecate `width` and `height`; prefer `style={{ width, height }}` sizing (PR #873).
- Deprecate `defaultScrollOffsetValue`; prefer `scrollOffsetValue` (PR #873).
- Prioritize `style` dimensions when both new and legacy props are provided (PR #873).
- Keep legacy props functional in v5 with migration warnings (PR #873).
