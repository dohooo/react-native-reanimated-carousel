[English](./README.md) | 简体中文

# react-native-reanimated-carousel

<img src="assets/0057BCEB-C948-47DC-8650-29CCBC6C1F8B.jpeg" width="100%"/>

![platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS-brightgreen.svg?style=flat-square&colorB=191A17)
[![npm](https://img.shields.io/npm/v/react-native-reanimated-carousel.svg?style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dm/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![github issues](https://img.shields.io/github/issues/dohooo/react-native-reanimated-carousel.svg?style=flat-square)](https://github.com/dohooo/react-native-reanimated-carousel/issues)
[![github closed issues](https://img.shields.io/github/issues-closed/dohooo/react-native-reanimated-carousel.svg?style=flat-square&colorB=44cc11)](https://github.com/dohooo/react-native-reanimated-carousel/issues?q=is%3Aissue+is%3Aclosed)

<p align="center">
  <img src="assets/normal.gif" width="300"/>  
</p>

<br/>

## ReactNative 社区最好用的轮播图组件! 🎉🎉🎉

-   完全解决了`react-native-snap-carousel`的[问题](https://github.com/meliorence/react-native-snap-carousel/issues/632)! 更多样式与 API 正在开发中...
-   **易用**、**无限滚动**、**完全使用 Reanimated2 实现**

## 原因

常见的无限滚动轮播图，在快速滑动时会出现卡住的情况，这是因为实现方式而导致的问题。这个组件用了不同的方式来实现，解决了这个问题，这就是创建这个库的原因。[在 SNACK 上尝试](https://snack.expo.dev/@zhaodonghao586/simple-carousel)

<p align="center">
  使用react-native-snap-carousel快速滑动，当到连接处时可以看清楚的看到卡顿。(gif 4.6mb)
</p>
<p align="center">
  <img src="assets/react-native-snap-carousel.gif" width="50%"/>
</p>

<p align="center">
  使用react-native-reanimated-carousel对比,每秒滚动十张依然顺畅链接，无限滚动。这里使用了gif无法很清晰的看出。（gif 83mb）
</p>
<p align="center">
  <img src="assets/fast.gif" width="50%"/>
</p>

---

## 安装

在项目根目录打开终端并且执行:

```sh
yarn add react-native-reanimated-carousel
```

如果你使用 npm:

```sh
npm install react-native-reanimated-carousel
```

并且我们需要安装 [`react-native-gesture-handler`](https://github.com/kmagiera/react-native-gesture-handler) 、[`react-native-reanimated(>=2.0.0)`](https://github.com/kmagiera/react-native-reanimated)，安装步骤可参考各自文档。

## EXPO

如果你使用 EXPO 托管工作流，请确定你的 EXPO SDK 版本大于 41，因为旧的版本并不支持`Reanimated(v2)`

## 使用

```tsx
import Carousel from 'react-native-reanimated-carousel';

<Carousel<{ color: string }>
    width={width}
    data={[{ color: 'red' }, { color: 'purple' }, { color: 'yellow' }]}
    renderItem={({ color }) => {
        return <View style={{ backgroundColor: color, flex: 1 }} />;
    }}
/>;
```

## 优化

-   当渲染大量元素时，可使用`windowSize`属性，来控制当前元素的两侧渲染数量，默认为全量渲染。经测试不加此属性，渲染 200 个空 view 时会出现掉帧情况，设置此属性后渲染 1000 个空 view 依旧流畅。（具体数量与测试的手机型号相关）

## Props

| name                    | required | default | types                                                                        | description                                                                                                                  |
| ----------------------- | -------- | ------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| data                    | ✅       |         | T[]                                                                          | 即将渲染的数据集合                                                                                                           |
| width                   | ✅       |         | number                                                                       | 轮播图容器的宽度                                                                                                             |
| renderItem              | ✅       |         | (data: T, index: number) => React.ReactNode                                  | 渲染元素的方法                                                                                                               |
| defaultIndex            | ❌       | 0       | number                                                                       | 默认 index                                                                                                                   |
| autoPlay                | ❌       | false   | boolean                                                                      | 是否自动播放                                                                                                                 |
| autoPlayReverse         | ❌       | false   | boolean                                                                      | 是否倒序自动播放                                                                                                             |
| autoPlayInterval        | ❌       | 1000    | autoPlayInterval                                                             | 自动播放的间隔                                                                                                               |
| mode                    | ❌       | defalut | 'default'\|'parallax'                                                        | 轮播图播放模式，`default`为默认无任何 UI 效果，演示图片使用的`parallax`                                                      |
| loop                    | ❌       | true    | boolean                                                                      | 是否循环播放                                                                                                                 |
| parallaxScrollingOffset | ❌       | 100     | number                                                                       | 当使用 mode=`parallax`,这个属性可以控制两侧图片离中间元素的距离                                                              |
| parallaxScrollingScale  | ❌       | 0.8     | number                                                                       | 当使用 mode=`parallax`,这个属性可以控制两侧图片的缩放比例                                                                    |
| style                   | ❌       | {}      | ViewStyle                                                                    | 轮播图容器样式                                                                                                               |
| height                  | ❌       | '100%'  | undefined \| string \| number                                                | 指定轮播图容器高度                                                                                                           |
| onSnapToItem            | ❌       |         | (index: number) => void                                                      | 切换至另一张轮播图时触发                                                                                                     |
| onScrollBegin           | ❌       |         | () => void                                                                   | 切换动画开始时触发                                                                                                           |
| onScrollEnd             | ❌       |         | (previous: number, current: number) => void                                  | 切换动画结束时触发                                                                                                           |
| panGestureHandlerProps  | ❌       | {}      | Omit<Partial\<PanGestureHandlerProps\>,'onHandlerStateChange'>               | PanGestureHandler props                                                                                                      |
| windowSize              | ❌       | 0       | number                                                                       | 能响应平移手势事件的最大 item 数量，0 表示所有元素都会先响应                                                                 |
| onProgressChange        | ❌       |         | onProgressChange?: (offsetProgress: number,absoluteProgress: number) => void | 当滚动进度发生变化时触发 `offsetProgress`:总的偏移值 (0 390 780 ...); `absoluteProgress`:转化为 index 的进度变化 (0 1 2 ...) |

## Ref

| name            | types                                       | description        |
| --------------- | ------------------------------------------- | ------------------ |
| prev            | ()=>void                                    | 切换至上一张       |
| loop            | ()=>void                                    | 切换至下一张       |
| goToIndex       | (index: number, animated?: boolean) => void | 切换至指定下标元素 |
| getCurrentIndex | ()=>number                                  | 获得当前轮播图下标 |

## 示例

```shell
yarn example -- ios
yarn example -- android
```

## 参与贡献

请参阅[贡献指南](CONTRIBUTING.md)了解如何对存储库和开发工作流做出贡献。

## 许可

MIT
