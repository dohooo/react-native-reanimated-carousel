# react-native-reanimated-carousel

<img src="assets/home-banner.png" width="100%"/>

![platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Web-brightgreen.svg?style=flat-square&colorB=191A17)
[![npm beta](https://img.shields.io/npm/v/react-native-reanimated-carousel/beta.svg?style=flat-square&label=beta)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dm/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![github issues](https://img.shields.io/github/issues/dohooo/react-native-reanimated-carousel.svg?style=flat-square)](https://github.com/dohooo/react-native-reanimated-carousel/issues)
[![discord chat](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/KsXRuDs43y)

A performant, customizable carousel for React Native, powered by Reanimated and Gesture Handler.

- [Getting started](https://rn-carousel.dev/usage)
- [API reference](https://rn-carousel.dev/props)
- [Examples](https://rn-carousel.dev/Examples/summary)
- [Migrating from v4](https://rn-carousel.dev/migration-v5)

## v5 highlights

- A smaller, named-only API with descriptive TypeScript types.
- Container sizing through `style`, with optional `itemSize` for a custom page distance.
- Explicit `layout`, `itemAnimation`, `snapMode`, and `orientation` contracts.
- Continuous logical `progress` plus signed pixel-level `scrollOffsetValue`.
- One `Pagination` component with loop-aware interpolation and accessible interactive dots.
- Stable item identity through `keyExtractor`, horizontal RTL normalization, and package `exports`.

## Installation

v5 is currently available under the npm `beta` tag.

Expo projects should let Expo select compatible Reanimated and Worklets versions:

```bash
npx expo install react-native-reanimated-carousel@beta react-native-reanimated react-native-worklets react-native-gesture-handler
```

React Native Community CLI projects can use their package manager:

```bash
yarn add react-native-reanimated-carousel@beta react-native-reanimated react-native-worklets react-native-gesture-handler
```

Follow the official setup instructions for [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation).

## Quick start

```tsx
import * as React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Carousel } from "react-native-reanimated-carousel";

const data = ["First", "Second", "Third"];

export default function App() {
  const { width } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Carousel
          style={{ width, height: 200 }}
          data={data}
          renderItem={({ item }) => (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text>{item}</Text>
            </View>
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
}
```

`loop` defaults to `false` in v5. Add `loop` when infinite wrapping is part of the product behavior.

## Version compatibility

| Carousel | Expo SDK | React Native | Reanimated | Gesture Handler | Worklets |
|---|---|---|---|---|---|
| **v5 beta** | **54–57 validated** | **0.80+** | **4.1.0+** | **2.9.0+** | **0.5.0+** |
| v4.x (EOL) | 50–53 | 0.70.3+ | 3.0.0+ | 2.9.0+ | — |
| v3.x (EOL) | 47–49 | 0.66.0+ | 2.0.0+ | 2.0.0+ | — |

Reanimated and Worklets must be a compatible pair. Expo users should use `expo install`; other projects should consult the [Reanimated compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility).

## Sponsors

<p align="center">
  <img src="https://github.com/dohooo/sponsors/blob/master/sponsors.png?raw=true"/>
</p>

## License

MIT
