# react-native-reanimated-carousel

<img src="assets/home-banner.png" width="100%"/>

![Hacktober Badge](https://img.shields.io/badge/hacktoberfest-2022-blueviolet)
![platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Web-brightgreen.svg?style=flat-square&colorB=191A17)
[![npm](https://img.shields.io/npm/v/react-native-reanimated-carousel.svg?style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dm/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dw/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![github issues](https://img.shields.io/github/issues/dohooo/react-native-reanimated-carousel.svg?style=flat-square)](https://github.com/dohooo/react-native-reanimated-carousel/issues)
[![github closed issues](https://img.shields.io/github/issues-closed/dohooo/react-native-reanimated-carousel.svg?style=flat-square&colorB=44cc11)](https://github.com/dohooo/react-native-reanimated-carousel/issues?q=is%3Aissue+is%3Aclosed)
[![discord chat](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/KsXRuDs43y)

## The best carousel component in React Native community. ⚡️

-   [Getting Started](https://rn-carousel.dev)
-   [Examples](https://rn-carousel.dev/Examples/summary)

## v5 beta highlights

- **Sizing**: `style` controls the **container size**; `itemWidth`/`itemHeight` control the **page size** (snap distance & animation progress).
- **Scroll offset shared value**: use `scrollOffsetValue` (recommended). `defaultScrollOffsetValue` is deprecated but still supported.
- **Progress**: `onProgressChange` supports both a callback and `SharedValue<number>`.
- **Pagination accessibility**: `Pagination.Basic` and `Pagination.Custom` support `paginationItemAccessibility` for per-item a11y overrides.
- **Custom animation safety**: `customAnimation` styles are sanitized and `zIndex` is normalized to finite integers.

## Installation

v5 is currently available under the npm `beta` tag. Install it explicitly while public testing continues.

Expo projects should let Expo select compatible Reanimated and Worklets versions:

```bash
npx expo install react-native-reanimated-carousel@beta react-native-reanimated react-native-worklets react-native-gesture-handler
```

React Native Community CLI projects can install the same packages with their package manager:

```bash
yarn add react-native-reanimated-carousel@beta react-native-reanimated react-native-worklets react-native-gesture-handler
```

Follow the official setup instructions for [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation). When upgrading from v4, read the [v5 migration guide](https://rn-carousel.dev/migration-v5).

## 📊 Version Compatibility

| Carousel Version | Expo SDK           | React Native                                  | Reanimated | Gesture Handler | Worklets   |
|------------------|--------------------|-----------------------------------------------|------------|-----------------|------------|
| **v5 beta**      | **54-57 validated** | **0.80+ (0.81, 0.83, 0.85, 0.86 validated)** | **4.1.0+** | **2.9.0+**      | **0.5.0+** |
| v4.x (EOL)       | 50-53              | 0.70.3+                                       | 3.0.0+     | 2.9.0+          | ❌          |
| v3.x (EOL)       | 47-49              | 0.66.0+                                       | 2.0.0+     | 2.0.0+          | ❌          |

Reanimated and Worklets must be a compatible pair. Expo users should use `expo install`; other projects should consult the [Reanimated compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility).

The Expo 54-57 matrix type-checks a packed consumer, exports Web, and builds Android. Native iOS and Android E2E currently run on Expo 54.


## Sponsors

<p align="center">
  <img src='https://github.com/dohooo/sponsors/blob/master/sponsors.png?raw=true'/>
</p>

## License

MIT
