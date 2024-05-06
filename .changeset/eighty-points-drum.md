---
"react-native-reanimated-carousel": patch
---

Fixed an issue where endWithSpring used outdated data from useSharedValue after onGestureEnd, causing incorrect carousel behavior on direction reversal.
