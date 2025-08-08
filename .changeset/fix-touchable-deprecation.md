---
"react-native-reanimated-carousel": patch
---

Replace deprecated TouchableWithoutFeedback with Pressable in pagination components

Fixes deprecation warnings by replacing TouchableWithoutFeedback with the recommended Pressable component in both Basic and Custom pagination items. This change maintains the same functionality while using the modern React Native API.

Closes #812