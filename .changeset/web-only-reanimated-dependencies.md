---
"react-native-reanimated-carousel": patch
---

Stop the per-render "dependencies should only be used in web implementation" warning from Reanimated 4.6+ on iOS and Android (Issue #953).
- Hook dependency arrays are now passed on Web only, where Reanimated can still use them without the Babel plugin.
