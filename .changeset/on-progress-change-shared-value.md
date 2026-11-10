---
"react-native-reanimated-carousel": patch
---

Throw a clear error instead of crashing natively when `onProgressChange` receives a shared value, the v4 form; pass it as `progress={value}`.
- The v5 codemod now makes that change when the file declares the value with `useSharedValue`.
