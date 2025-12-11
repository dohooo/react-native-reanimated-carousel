---
"react-native-reanimated-carousel": patch
---

Fix pagination accessibility state by syncing selection with scheduleOnRN instead of reading reanimated values during render, and add coverage to avoid test warnings.
