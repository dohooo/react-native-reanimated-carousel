English | [简体中文](./README.zh-CN.md)

# react-native-reanimated-carousel

<img src="assets/54995FB4-3F72-48E4-BA5D-0A859D8EBD92.png" width="100%"/>

![platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS-brightgreen.svg?style=flat-square&colorB=191A17)
[![npm](https://img.shields.io/npm/v/react-native-reanimated-carousel.svg?style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dm/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![github issues](https://img.shields.io/github/issues/dohooo/react-native-reanimated-carousel.svg?style=flat-square)](https://github.com/dohooo/react-native-reanimated-carousel/issues)
[![github closed issues](https://img.shields.io/github/issues-closed/dohooo/react-native-reanimated-carousel.svg?style=flat-square&colorB=44cc11)](https://github.com/dohooo/react-native-reanimated-carousel/issues?q=is%3Aissue+is%3Aclosed)

<p align="center">
  <img src="assets/normal.gif" width="300"/>  
</p>

<br/>

## ReactNative community's best use of the carousel component! 🎉🎉🎉

- It completely solves this [problem](https://github.com/meliorence/react-native-snap-carousel/issues/632) for `react-native-snap-carousel`!  More styles and apis in development... [Try it](https://snack.expo.dev/@zhaodonghao586/simple-carousel)
- **Simple**、**Infinitely scrolling very smooth**、**Fully implemented using Reanimated 2!**

## Reason
<details>
<summary>The common RN infinite scroll component. It get stuck on a fast slide. Wait for the next element to appear. This component will not have similar problems.Because using a completely different approach so the best performance is achieved.That's why this library was created.</summary>
<p align="center">
  Use react-native-snap-carousel for quick swiping,you can see caton clearly when you reach the junction.(gif 4.6mb)
</p>
<p align="center">
  <img src="assets/react-native-snap-carousel.gif" width="50%"/>
</p>

<p align="center">
  Compared with react-native-reanimated-carousel,The actual test was ten slides per second, but it didn't show up very well in gif.（gif 83mb）
</p>
<p align="center">
  <img src="assets/fast.gif" width="50%"/>
</p>
</details>

---

## Installation

Open a Terminal in the project root and run:

```sh
yarn add react-native-reanimated-carousel
```

Or if you use npm:

```sh
npm install react-native-reanimated-carousel
```

Now we need to install [`react-native-gesture-handler`](https://github.com/kmagiera/react-native-gesture-handler) and [`react-native-reanimated(>=2.0.0)`](https://github.com/kmagiera/react-native-reanimated).

## EXPO

If use EXPO managed workflow please ensure that the version is greater than 41.Because the old version not support `Reanimated(v2)`

## Usage

```tsx
import Carousel from 'react-native-reanimated-carousel';

<Carousel<{ color: string }>
    width={ width }
    data={[{ color: 'red' }, { color: 'purple' }, { color: 'yellow' }]}
    renderItem={({ color }) => {
        return <View style={{ backgroundColor: color, flex: 1}}/>
    }}
/>;
```

## Optimizing
- When rendering a large number of elements, you can use the 'windowSize' property to control how many items of the current element are rendered. The default is full rendering. After testing without this property, frames will drop when rendering 200 empty views. After setting this property, rendering 1000 empty views is still smooth. (The specific number depends on the phone model tested)

## Props

| name                    | required | default        | types                                                                        | description                                                                                                                    |
| ----------------------- | -------- | -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| data                    | ✅       |                | T[]                                                                          | Carousel items data set                                                                                                        |
| width                   | ✅       |                | number                                                                       | Specified carousel container width                                                                                             |
| renderItem              | ✅       |                | (data: T, index: number) => React.ReactNode                                  | Render carousel item                                                                                                           |
| defaultIndex            | ❌       | 0              | number                                                                       | Default index                                                                                                                  |
| autoPlay                | ❌       | false          | boolean                                                                      | Auto play                                                                                                                      |
| autoPlayReverse         | ❌       | false          | boolean                                                                      | Auto play reverse playback                                                                                                     |
| autoPlayInterval        | ❌       | 1000           | autoPlayInterval                                                             | Auto play playback interval                                                                                                    |
| mode                    | ❌       | defalut        | 'default'\|'parallax'                                                        | Carousel Animated transitions                                                                                                  |
| loop                    | ❌       | true           | boolean                                                                      | Carousel loop playback                                                                                                         |
| parallaxScrollingOffset | ❌       | 100            | number                                                                       | When use 'parallax' Layout props,this prop can be control prev/next item offset                                                |
| parallaxScrollingScale  | ❌       | 0.8            | number                                                                       | When use 'parallax' Layout props,this prop can be control prev/next item scale                                                 |
| style                   | ❌       | {}             | ViewStyle                                                                    | Carousel container style                                                                                                       |
| height                  | ❌       | '100%'         | undefined \| string \| number                                                | Specified carousel container height                                                                                            |
| springConfig            | ❌       | {damping: 100} | Animated.WithSpringConfig                                                    | Spring config of translation animated                                                                                          |
| onSnapToItem            | ❌       |                | (index: number) => void                                                      | Callback fired when navigating to an item                                                                                      |
| onScrollBegin           | ❌       |                | () => void                                                                   | Callback fired when scroll begin                                                                                               |
| onScrollEnd             | ❌       |                | (previous: number, current: number) => void                                  | Callback fired when scroll end                                                                                                 |
| panGestureHandlerProps  | ❌       | {}             | Omit<Partial\<PanGestureHandlerProps\>,'onHandlerStateChange'>               | PanGestureHandler props                                                                                                        |
| windowSize              | ❌       | 0              | number                                                                       | The maximum number of items that can respond to pan gesture events, `0` means all items will respond to pan gesture events
| onProgressChange        | ❌       |                | onProgressChange?: (offsetProgress: number,absoluteProgress: number) => void | On progress change. `offsetProgress`:Total of offset distance (0 390 780 ...); `absoluteProgress`:Convert to index (0 1 2 ...) |

## Ref

| name            | types                                       | description            |
| --------------- | ------------------------------------------- | ---------------------- |
| prev            | ()=>void                                    | Play the last one      |
| loop            | ()=>void                                    | Play the next one      |
| goToIndex       | (index: number, animated?: boolean) => void | Go to index            |
| getCurrentIndex | ()=>number                                  | Get current item index |

## Example

```shell
yarn example -- ios
yarn example -- android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
