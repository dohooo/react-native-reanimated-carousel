---
"react-native-reanimated-carousel": patch
---

- Fix gesture blocking with `style={{ flex: 1 }}` by reading `resolvedSize.value` on the UI thread (PR #878).
- Fix `itemWidth`/`itemHeight` precedence over `style.width` in `ItemLayout` (PR #878).
