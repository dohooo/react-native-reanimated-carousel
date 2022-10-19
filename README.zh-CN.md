[English](./README.md) | 简体中文

# react-native-reanimated-carousel

<img src="assets/home-banner-zh.png" width="100%"/>

![Hacktober Badge](https://img.shields.io/badge/hacktoberfest-2022-blueviolet)
![platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Web-brightgreen.svg?style=flat-square&colorB=191A17)
[![npm](https://img.shields.io/npm/v/react-native-reanimated-carousel.svg?style=flat-square)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dm/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![npm](https://img.shields.io/npm/dw/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6)](https://www.npmjs.com/package/react-native-reanimated-carousel)
[![github issues](https://img.shields.io/github/issues/dohooo/react-native-reanimated-carousel.svg?style=flat-square)](https://github.com/dohooo/react-native-reanimated-carousel/issues)
[![github closed issues](https://img.shields.io/github/issues-closed/dohooo/react-native-reanimated-carousel.svg?style=flat-square&colorB=44cc11)](https://github.com/dohooo/react-native-reanimated-carousel/issues?q=is%3Aissue+is%3Aclosed)
[![discord chat](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/KsXRuDs43y)

## ReactNative 社区最好用的轮播图组件! 🎉🎉🎉

-   **完全解决了`react-native-snap-carousel`的** [[问题]](https://github.com/meliorence/react-native-snap-carousel/issues/632)
-   **易用**、**无限滚动**、**完全使用 Reanimated2 实现**

> v2 已经发布，希望大家喜欢!~ [[v1 文档]](https://github.com/dohooo/react-native-reanimated-carousel/tree/v1.x.x)

> 支持 Web 端 [[示例]](https://dohooo.github.io/react-native-reanimated-carousel/)

> 点击图片，查看代码 [[试一下]](https://snack.expo.dev/@zhaodonghao586/simple-carousel) 🍺

|              <img src="assets/normal-horizontal.gif"/>               |                <img src="assets/normal-vertical.gif"/>                |              <img src="assets/parallax-horizontal.gif"/>               |
| :------------------------------------------------------------------: | :-------------------------------------------------------------------: | :--------------------------------------------------------------------: |
|  <a href="./exampleExpo/src/normal/index.tsx">normal-horizontal</a>  |   <a href="./exampleExpo/src/normal/index.tsx">normal-vertical</a>    | <a href="./exampleExpo/src/parallax/index.tsx">parallax-horizontal</a> |
|              <img src="assets/parallax-vertical.gif"/>               |             <img src="assets/stack-horizontal-left.gif"/>             |             <img src="assets/stack-horizontal-right.gif"/>             |
| <a href="./exampleExpo/src/parallax/index.tsx">parallax-vertical</a> | <a href="./exampleExpo/src/stack/index.tsx">stack-horizontal-left</a> | <a href="./exampleExpo/src/stack/index.tsx">stack-horizontal-right</a> |
|             <img src="assets/stack-vertical-left.gif"/>              |             <img src="assets/stack-vertical-right.gif"/>              |             <img src="assets/stack-horizontal-right.gif"/>             |
| <a href="./exampleExpo/src/stack/index.tsx">stack-vertical-left</a>  | <a href="./exampleExpo/src/stack/index.tsx">stack-vertical-right</a>  | <a href="./exampleExpo/src/stack/index.tsx">stack-horizontal-right</a> |
|                  <img src="assets/left-align.gif"/>                  |
|   <a href="./exampleExpo/src/left-align/index.tsx">left-align</a>    |

> 现在你可以和我们一起来制作酷炫的动画了！ 非常简单! [[详情]](./docs/custom-animation.zh-CN.md)

|                          <img src="assets/advanced-parallax.gif"/>                          |                      <img src="assets/pause-advanced-parallax.gif"/>                      |                   <img src="assets/scale-fade-in-out.gif"/>                   |
| :-----------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
|        <a href="./exampleExpo/src/advanced-parallax/index.tsx">advanced-parallax</a>        | <a href="./exampleExpo/src/pause-advanced-parallax/index.tsx">pause-advanced-parallax</a> | <a href="./exampleExpo/src/scale-fade-in-out/index.tsx">scale-fade-in-out</a> |
|                      <img src="assets/rotate-scale-fade-in-out.gif"/>                       |                           <img src="assets/rotate-in-out.gif"/>                           |                     <img src="assets/anim-tab-bar.gif"/>                      |
| <a href="./exampleExpo/src/rotate-scale-fade-in-out/index.tsx">rotate-scale-fade-in-out</a> |           <a href="./exampleExpo/src/rotate-in-out/index.tsx">rotate-in-out</a>           |      <a href="./exampleExpo/src/anim-tab-bar/index.tsx">anim-tab-bar</a>      |
|                               <img src="assets/marquee.gif"/>                               |                             <img src="assets/multiple.gif"/>                              |                       <img src="assets/circular.gif"/>                        |
|                  <a href="./exampleExpo/src/marquee/index.tsx">marquee</a>                  |                <a href="./exampleExpo/src/multiple/index.tsx">multiple</a>                |          <a href="./exampleExpo/src/circular/index.tsx">circular</a>          |
|                                <img src="assets/fold.gif"/>                                 |                               <img src="assets/tear.gif"/>                                |                      <img src="assets/press-swipe.gif"/>                      |
|                     <a href="./exampleExpo/src/fold/index.tsx">fold</a>                     |                    <a href="./exampleExpo/src/tear/index.tsx">tear</a>                    |       <a href="./exampleExpo/src/press-swipe/index.tsx">press-swipe</a>       |
|                               <img src="assets/cube-3d.gif"/>                               |                           <img src="assets/blur-parallax.gif"/>                           |                   <img src="assets/curve.gif"/>                               |
|                  <a href="./exampleExpo/src/cube-3d/index.tsx">cube-3d</a>                  |           <a href="./exampleExpo/src/blur-parallax/index.tsx">blur-parallax</a>           |               <a href="./exampleExpo/src/curve/index.tsx">curve</a>           |
|                           <img src="assets/parallax-layers.gif"/>                           |                            <img src="assets/stack-cards.gif"/>                            |                         <img src="assets/flow.gif"/>                          |
|          <a href="./exampleExpo/src/parallax-layers/index.tsx">parallax-layers</a>          |             <a href="./exampleExpo/src/stack-cards/index.tsx">stack-cards</a>             |              <a href="./exampleExpo/src/flow/index.tsx">flow</a>              |

## 目录

1. [安装](#安装)
1. [使用](#使用)
1. [Props](./docs/props.zh-CN.md)
1. [提示](#提示)
1. [原因](#原因)
1. [示例](#示例)

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
| | react-native-reanimated | react-native-gesture-handler |
| -------------------------------------- | ----------------------- | ---------------------------- |
| react-native-reanimated-carousel < v3 | <2.7.0 | \* |
| react-native-reanimated-carousel >= v3 | >=2.7.0 | \* |

## 使用

```tsx
import * as React from 'react';
import { Dimensions, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

function Index() {
    const width = Dimensions.get('window').width;
    return (
        <View style={{ flex: 1 }}>
            <Carousel
                loop
                width={width}
                height={width / 2}
                autoPlay={true}
                data={[...new Array(6).keys()]}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => console.log('current index:', index)}
                renderItem={({ index }) => (
                    <View
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ textAlign: 'center', fontSize: 30 }}>
                            {index}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

export default Index;
```

## 提示

-   优化
    -   当渲染大量元素时，可使用`windowSize`属性，来控制当前元素的两侧渲染数量，默认为全量渲染。经测试不加此属性，渲染 200 个空 view 时会出现掉帧情况，设置此属性后渲染 1000 个空 view 依旧流畅。（具体数量与测试的手机型号相关）
-   在`ScrollView/FlastList`中使用

    -   **[#143](https://github.com/dohooo/react-native-reanimated-carousel/issues/143) - Carousel suppresses ScrollView/FlastList scroll gesture handler:** 当轮播图被放置在 ScrollView/FlatList 中时，轮播图的部分将无法控制列表滚动，解决办法是我们只允许手势系统识别某一方向，而不是所有方向，在下方例子中我们为了让列表可以向下滑动，所以我们使用[activeOffsetX](https://docs.swmansion.com/react-native-gesture-handler/docs/1.10.3/api/gesture-handlers/pan-gh/#activeoffsetx)属性来控制轮播图只识别横向手势:

        ```tsx
        <Carousel
          {...}
          panGestureHandlerProps={{
            activeOffsetX: [-10, 10],
          }}
        />
        ```

-   RTL
    -   所有 layout 均完美支持 RTL 模式，并且无需再做任何配置。但在 RTL 模式下使用自动播放时，默认不会自动转换方向，需要结合 autoPlayReverse 来手动控制方向。
-   EXPO
    -   如果你使用 EXPO 托管工作流，请确定你的 EXPO SDK 版本大于 41，因为旧的版本并不支持`Reanimated(v2)`。
-   工作原理
    - [关于RNRC](./docs/about.zh-CN.md)

## 原因

<details>
  <summary>常见的无限滚动轮播图，在快速滑动时会出现卡住的情况，这是因为实现方式而导致的问题。所以这个组件用了完全不同的方式来实现，并获得了最佳的性能也解决了这个问题，这就是创建这个库的原因。</summary>
  <p align="center">
  使用react-native-snap-carousel快速滑动，当到连接处时可以看清楚的看到卡顿。(gif 4.6mb)
</p>
<p align="center">
  <img src="assets/react-native-snap-carousel.gif" width="50%"/>
</p>

<p align="center">
  使用react-native-reanimated-carousel对比,每秒滚动十张依然顺畅链接，无限滚动。这里使用了gif无法很清晰的看出。
</p>
<p align="center">
  <img src="assets/normal-fast.gif" width="50%"/>
</p>
</details>

## 示例

> `:pretty` 使用更好看的图片

```shell
yarn ios
yarn ios:pretty

yarn android
yarn android:pretty

yarn web
yarn web:pretty
```

## 赞助商

<p align="center">
  <img src='https://github.com/dohooo/sponsors/blob/master/sponsors.png?raw=true'/>
</p>

## 许可

MIT
