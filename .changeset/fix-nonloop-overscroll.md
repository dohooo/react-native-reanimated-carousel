---
"react-native-reanimated-carousel": patch
---

Fix non-loop overscroll direction so tiny positive offsets at the first page no longer wrap to the last page when calling next()/scrollTo(), and add integration coverage for the scenario. Thanks to @hennessyevan for the original report and PR 839 inspiration.
