---
"react-native-reanimated-carousel": patch
---

Remove the nested `GestureHandlerRootView` so correctly configured apps no longer log the Android parent-root warning (Issue #921).
- Preserve carousel navigation and gestures by relying on the application-level Gesture Handler root required during installation.
