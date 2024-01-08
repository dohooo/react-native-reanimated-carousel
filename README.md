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

-   **It completely solved this** [problem](https://github.com/meliorence/react-native-snap-carousel/issues/632) **for `react-native-snap-carousel`**
-   **Fully implemented using Reanimated 2&3**
-   **[Demo](https://dohooo.github.io/react-native-reanimated-carousel/)**

## Getting Started

Check out [the documentation website](https://reanimated-carousel.dev).

## Examples

> Click on the image to see the code snippets [[Try it]](https://snack.expo.dev/@zhaodonghao586/simple-carousel) 🍺

|              <img src="assets/normal-horizontal.gif"/>               |                <img src="assets/normal-vertical.gif"/>                |              <img src="assets/parallax-horizontal.gif"/>               |
| :------------------------------------------------------------------: | :-------------------------------------------------------------------: | :--------------------------------------------------------------------: |
|  <a href="./example/app/src/pages/normal/index.tsx">normal-horizontal</a>  |   <a href="./example/app/src/pages/normal/index.tsx">normal-vertical</a>    | <a href="./example/app/src/pages/parallax/index.tsx">parallax-horizontal</a> |
|              <img src="assets/parallax-vertical.gif"/>               |             <img src="assets/stack-horizontal-left.gif"/>             |             <img src="assets/stack-horizontal-right.gif"/>             |
| <a href="./example/app/src/pages/parallax/index.tsx">parallax-vertical</a> | <a href="./example/app/src/pages/stack/index.tsx">stack-horizontal-left</a> | <a href="./example/app/src/pages/stack/index.tsx">stack-horizontal-right</a> |
|             <img src="assets/stack-vertical-left.gif"/>              |             <img src="assets/stack-vertical-right.gif"/>              |             <img src="assets/stack-horizontal-right.gif"/>             |
| <a href="./example/app/src/pages/stack/index.tsx">stack-vertical-left</a>  | <a href="./example/app/src/pages/stack/index.tsx">stack-vertical-right</a>  | <a href="./example/app/src/pages/stack/index.tsx">stack-horizontal-right</a> |
|                  <img src="assets/left-align.gif"/>                  | |                  <img src="assets/right-align.gif" >                  |
|   <a href="./example/app/src/pages/left-align/index.tsx">left-align</a>    |  |   <a href="./example/app/src/pages/right-align/index.tsx">right-align</a>    |

> You can make cool animations with custom animation API [[Details]](https://reanimated-carousel.dev/custom-animations)

|                          <img src="assets/advanced-parallax.gif"/>                          |                      <img src="assets/pause-advanced-parallax.gif"/>                      |                   <img src="assets/scale-fade-in-out.gif"/>                   |
| :-----------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
|        <a href="./example/app/src/pages/advanced-parallax/index.tsx">advanced-parallax</a>        | <a href="./example/app/src/pages/pause-advanced-parallax/index.tsx">pause-advanced-parallax</a> | <a href="./example/app/src/pages/scale-fade-in-out/index.tsx">scale-fade-in-out</a> |
|                      <img src="assets/rotate-scale-fade-in-out.gif"/>                       |                           <img src="assets/rotate-in-out.gif"/>                           |                     <img src="assets/anim-tab-bar.gif"/>                      |
| <a href="./example/app/src/pages/rotate-scale-fade-in-out/index.tsx">rotate-scale-fade-in-out</a> |           <a href="./example/app/src/pages/rotate-in-out/index.tsx">rotate-in-out</a>           |      <a href="./example/app/src/pages/anim-tab-bar/index.tsx">anim-tab-bar</a>      |
|                               <img src="assets/marquee.gif"/>                               |                             <img src="assets/multiple.gif"/>                              |                       <img src="assets/circular.gif"/>                        |
|                  <a href="./example/app/src/pages/marquee/index.tsx">marquee</a>                  |                <a href="./example/app/src/pages/multiple/index.tsx">multiple</a>                |          <a href="./example/app/src/pages/circular/index.tsx">circular</a>          |
|                                <img src="assets/fold.gif"/>                                 |                               <img src="assets/tear.gif"/>                                |                      <img src="assets/press-swipe.gif"/>                      |
|                     <a href="./example/app/src/pages/fold/index.tsx">fold</a>                     |                    <a href="./example/app/src/pages/tear/index.tsx">tear</a>                    |       <a href="./example/app/src/pages/press-swipe/index.tsx">press-swipe</a>       |
|                               <img src="assets/cube-3d.gif"/>                               |                           <img src="assets/blur-parallax.gif"/>                           |                   <img src="assets/curve.gif"/>                               |
|                  <a href="./example/app/src/pages/cube-3d/index.tsx">cube-3d</a>                  |           <a href="./example/app/src/pages/blur-parallax/index.tsx">blur-parallax</a>           |               <a href="./example/app/src/pages/curve/index.tsx">curve</a>           |
|                           <img src="assets/parallax-layers.gif"/>                           |                            <img src="assets/stack-cards.gif"/>                            |                         <img src="assets/flow.gif"/>                          |
|          <a href="./example/app/src/pages/parallax-layers/index.tsx">parallax-layers</a>          |             <a href="./example/app/src/pages/stack-cards/index.tsx">stack-cards</a>             |              <a href="./example/app/src/pages/flow/index.tsx">flow</a>              |
|                           <img src="assets/blur-rotate.gif"/>                           |                            ||
|          <a href="./example/app/src/pages/blur-rotate/index.tsx">blur-rotate</a>          |                          |                            |


## Sponsors

<p align="center">
  <img src='https://github.com/dohooo/sponsors/blob/master/sponsors.png?raw=true'/>
</p>

## License

MIT
