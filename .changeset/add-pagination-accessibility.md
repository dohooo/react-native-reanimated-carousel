---
"react-native-reanimated-carousel": patch
---

Add accessibility support to pagination components and replace deprecated TouchableWithoutFeedback with Pressable

- Add comprehensive accessibility props (accessibilityLabel, accessibilityRole, accessibilityHint, accessibilityState) to both Basic and Custom pagination components
- Add carouselName prop to allow descriptive accessibility labels
- Replace TouchableWithoutFeedback with Pressable to remove deprecation warnings
- Improve screen reader support with proper labeling and state information

Co-authored-by: AlexJackson01 <alex@example.com>