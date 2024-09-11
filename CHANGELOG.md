# react-native-reanimated-carousel

## 4.0.0-canary.13

### Patch Changes

- [#629](https://github.com/dohooo/react-native-reanimated-carousel/pull/629) [`80ec737`](https://github.com/dohooo/react-native-reanimated-carousel/commit/80ec737b726c1522f2af0308afb9b95ad6f9be4d) Thanks [@nickoelsner](https://github.com/nickoelsner)! - fix: typescript error where MeasuredDimension can be null

- [#652](https://github.com/dohooo/react-native-reanimated-carousel/pull/652) [`2916a26`](https://github.com/dohooo/react-native-reanimated-carousel/commit/2916a26eb0392b600aa06e3b8b4bf419c68f0723) Thanks [@bdtren](https://github.com/bdtren)! - Add <Pagination.Custom/> dot animation.

- [#577](https://github.com/dohooo/react-native-reanimated-carousel/pull/577) [`17621ca`](https://github.com/dohooo/react-native-reanimated-carousel/commit/17621ca772cc3f166094e1445253f77a0967a201) Thanks [@nmassey](https://github.com/nmassey)! - fix: make gesture onStart/onUpdate/onEnd (et al) callbacks run as worklets again

- [#648](https://github.com/dohooo/react-native-reanimated-carousel/pull/648) [`0abdb2d`](https://github.com/dohooo/react-native-reanimated-carousel/commit/0abdb2d51fba1d309a065ed614713d792b6e70a5) Thanks [@nmassey](https://github.com/nmassey)! - fix app crash when using "onProgressChange" prop as function

- [#576](https://github.com/dohooo/react-native-reanimated-carousel/pull/576) [`a99f069`](https://github.com/dohooo/react-native-reanimated-carousel/commit/a99f069b5c4bace6e0cf42d457d3d3363321dd7f) Thanks [@nmassey](https://github.com/nmassey)! - fix: rework code to avoid possible flicker when starting pan (panOffset race condition)

## 4.0.0-alpha.12

### Patch Changes

- [#574](https://github.com/dohooo/react-native-reanimated-carousel/pull/574) [`86da6ac`](https://github.com/dohooo/react-native-reanimated-carousel/commit/86da6acb823ec2deaa71f4cb90d392d1cccf48b5) Thanks [@nmassey](https://github.com/nmassey)! - Fixed an issue where endWithSpring used outdated data from useSharedValue after onGestureEnd, causing incorrect carousel behavior on direction reversal.

## 4.0.0-alpha.11

### Patch Changes

- [#597](https://github.com/dohooo/react-native-reanimated-carousel/pull/597) [`0d2b930`](https://github.com/dohooo/react-native-reanimated-carousel/commit/0d2b930f394f65fd70a03593ea8c7b16fb552e62) Thanks [@dohooo](https://github.com/dohooo)! - Adds Pagination Component

## 4.0.0-alpha.10

### Patch Changes

- [#560](https://github.com/dohooo/react-native-reanimated-carousel/pull/560) [`c181174`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c1811746e951ca32bf94bc2acca450fb2e58f55c) Thanks [@dohooo](https://github.com/dohooo)! - Add a new props `minScrollDistancePerSwipe` to set the minimum scroll instance to make carousel scroll.

## 4.0.0-alpha.9

### Patch Changes

- [#528](https://github.com/dohooo/react-native-reanimated-carousel/pull/528) [`139d5e5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/139d5e5f7706e1da8800ff10b933d1010835f52f) Thanks [@dohooo](https://github.com/dohooo)! - Exported TAnimationStyle types.

- [#528](https://github.com/dohooo/react-native-reanimated-carousel/pull/528) [`b654f43`](https://github.com/dohooo/react-native-reanimated-carousel/commit/b654f439e905bc1d45f5cbb1fd291f3a82848368) Thanks [@dohooo](https://github.com/dohooo)! - Replaced 'onScrollBegin' with 'onScrollStart' to better match gesture callback.

## 4.0.0-alpha.8

### Patch Changes

- [#517](https://github.com/dohooo/react-native-reanimated-carousel/pull/517) [`9f3a3d6`](https://github.com/dohooo/react-native-reanimated-carousel/commit/9f3a3d6be31a251528fce89613b6308c5382fa93) Thanks [@dohooo](https://github.com/dohooo)! - Reduce the amount of work done when rendering data.

## 4.0.0-alpha.7

### Patch Changes

- [#510](https://github.com/dohooo/react-native-reanimated-carousel/pull/510) [`b3cc591`](https://github.com/dohooo/react-native-reanimated-carousel/commit/b3cc591dcee83cf240864051018c4aa8403c3f86) Thanks [@dohooo](https://github.com/dohooo)! - Support to specific direction to auto play.

- [#510](https://github.com/dohooo/react-native-reanimated-carousel/pull/510) [`b3cc591`](https://github.com/dohooo/react-native-reanimated-carousel/commit/b3cc591dcee83cf240864051018c4aa8403c3f86) Thanks [@dohooo](https://github.com/dohooo)! - Modify the preority of windowSize settings. If you define the windowSize prop, Carousel will ignore the itemsCount. (windowSize > itemsCount)

## 4.0.0-alpha.6

### Minor Changes

- [#507](https://github.com/dohooo/react-native-reanimated-carousel/pull/507) [`c6d58e5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c6d58e5f099145b1d74a18c4b73a5d3dc1c515e3) Thanks [@dohooo](https://github.com/dohooo)! - Support to fix the scroll direction through new API, fixedDirection.

### Patch Changes

- [#507](https://github.com/dohooo/react-native-reanimated-carousel/pull/507) [`353fdce`](https://github.com/dohooo/react-native-reanimated-carousel/commit/353fdce59c1b38796801e4180f6ac8dde879f936) Thanks [@dohooo](https://github.com/dohooo)! - remove postinstall script.

## 4.0.0-alpha.5

### Patch Changes

- [#503](https://github.com/dohooo/react-native-reanimated-carousel/pull/503) [`03dba70`](https://github.com/dohooo/react-native-reanimated-carousel/commit/03dba70a857d6531eceb1ea4d2fd034e3090fe48) Thanks [@dohooo](https://github.com/dohooo)! - remove the postinstall script.

## 4.0.0-alpha.4

### Patch Changes

- [#498](https://github.com/dohooo/react-native-reanimated-carousel/pull/498) [`096ac75`](https://github.com/dohooo/react-native-reanimated-carousel/commit/096ac756a28aea1ff771b046282320cdac356af8) Thanks [@dohooo](https://github.com/dohooo)! - re-calculate when window size changed in browser. (re-bump for alpha.3)

## 4.0.0-alpha.3

### Patch Changes

- [#496](https://github.com/dohooo/react-native-reanimated-carousel/pull/496) [`fdeef6b`](https://github.com/dohooo/react-native-reanimated-carousel/commit/fdeef6bd8355de80ea8cdb1cb334a4228819d4d2) Thanks [@dohooo](https://github.com/dohooo)! - re-calculate when window size changed in browser.

## 4.0.0-alpha.2

### Patch Changes

- [#494](https://github.com/dohooo/react-native-reanimated-carousel/pull/494) [`6b849ec`](https://github.com/dohooo/react-native-reanimated-carousel/commit/6b849ecf1ab0ce265278ec6f925b556de4d15353) Thanks [@dohooo](https://github.com/dohooo)! - Removed the reset logic when user change the defaultIndex prop. (We couldn't update the handlerOffset value when user change the defaultIndex. Because the carousel component already be a non-controlled component. So the subsequent changes of defaultIndex will be ignored.)

## 4.0.0-alpha.1

### Patch Changes

- [#492](https://github.com/dohooo/react-native-reanimated-carousel/pull/492) [`978b59f`](https://github.com/dohooo/react-native-reanimated-carousel/commit/978b59f0f2d8a96fe1d1de1a1c9fb205fd051cfb) Thanks [@dohooo](https://github.com/dohooo)! - feat: change the way of PanGestureHandler modification from panGestureHandlerProps to onConfigurePanGesture.

  e.g.

  ```tsx
  <Carousel
    onConfigurePanGesture={(gestureChain) => {
      gestureChain.activeOffsetX([-10, 10]);
    }}
  />
  ```

- [#492](https://github.com/dohooo/react-native-reanimated-carousel/pull/492) [`c015873`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c015873b7a8f4f357b7342c250220ea9968d8b58) Thanks [@dohooo](https://github.com/dohooo)! - Fixed an issue where the enable props couldn't set to false.

## 4.0.0-alpha.0

### Major Changes

- 56e20c8: feat: use new RNGH api

  Updates `react-native-gesture-handler` to `>=2.9.0` and replaces usage of `useAnimatedGestureHandler` with the [new gesture handler API](https://docs.swmansion.com/react-native-gesture-handler/docs/#rngh-20) which supports the [new gesture handler web implementation](https://github.com/software-mansion/react-native-gesture-handler/pull/2157).

## 3.5.1

### Patch Changes

- 870b130: Fixed ref unsable issue.

## 3.5.0

### Minor Changes

- c117a3a: Reducing default seetings for Android. (gestureHandlerRootHOC)

## 3.4.0

### Minor Changes

- 8ea24ca: Added `maxScrollDistancePerSwipe` props.

## 3.3.2

### Patch Changes

- 0237ae8: Solved the crush issue.

## 3.3.1

### Patch Changes

- b09fb81: chore: only push the lib to npm.

## 3.3.0

### Minor Changes

- 677b37b: 🚀 Support to test.

## 3.2.0

### Minor Changes

- 01184e9: 🚀 Add new props `overscrollEnabled` to support scrolling management.
