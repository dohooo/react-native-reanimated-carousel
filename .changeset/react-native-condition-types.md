---
"react-native-reanimated-carousel": patch
---

Point the `react-native` export condition at the shipped declarations so apps stop type-checking the package source (Issues #959, #967).
- Expo projects (`customConditions: ["react-native"]`) now resolve `lib/typescript` types, covered by `skipLibCheck`; Metro still bundles `src`.
