# react-native-reanimated-carousel

## 4.0.2

### Patch Changes

- [`2b91b7e`](https://github.com/dohooo/react-native-reanimated-carousel/commit/2b91b7ef89222ee924da44eff4974774c3c00221) Thanks [@dohooo](https://github.com/dohooo)! - change width breaking the pagination component

## 4.0.1

### Patch Changes

- [`8bfb7b1`](https://github.com/dohooo/react-native-reanimated-carousel/commit/8bfb7b1a991f3c5bb81988a5d9cccb35d31644f9) Thanks [@dohooo](https://github.com/dohooo)! - Configure Babel for React Native Reanimated build

## 4.0.0

### Major Changes

- [#444](https://github.com/dohooo/react-native-reanimated-carousel/pull/444) [`56e20c8`](https://github.com/dohooo/react-native-reanimated-carousel/commit/56e20c80163bc42fe59fcfb6476ae6b3a345ad4b) Thanks [@dohooo](https://github.com/dohooo)! - feat: use new RNGH api

  Updates `react-native-gesture-handler` to `>=2.9.0` and replaces usage of `useAnimatedGestureHandler` with the [new gesture handler API](https://docs.swmansion.com/react-native-gesture-handler/docs/#rngh-20) which supports the [new gesture handler web implementation](https://github.com/software-mansion/react-native-gesture-handler/pull/2157).

### Minor Changes

- [#507](https://github.com/dohooo/react-native-reanimated-carousel/pull/507) [`c6d58e5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c6d58e5f099145b1d74a18c4b73a5d3dc1c515e3) Thanks [@dohooo](https://github.com/dohooo)! - Support to fix the scroll direction through new API, fixedDirection.

### Patch Changes

- [#687](https://github.com/dohooo/react-native-reanimated-carousel/pull/687) [`55c55ff`](https://github.com/dohooo/react-native-reanimated-carousel/commit/55c55ff8304159ab2949b0335ac34411030b94b7) Thanks [@dohooo](https://github.com/dohooo)! - feat: Add containerStyle prop to control the container styles.

- [`d5de105`](https://github.com/dohooo/react-native-reanimated-carousel/commit/d5de105b977c9a2b578e97cce663d10a6bf1214f) Thanks [@dohooo](https://github.com/dohooo)! - Added missing dependencies for web to work

- [#507](https://github.com/dohooo/react-native-reanimated-carousel/pull/507) [`353fdce`](https://github.com/dohooo/react-native-reanimated-carousel/commit/353fdce59c1b38796801e4180f6ac8dde879f936) Thanks [@dohooo](https://github.com/dohooo)! - remove postinstall script.

- [#666](https://github.com/dohooo/react-native-reanimated-carousel/pull/666) [`2982fcd`](https://github.com/dohooo/react-native-reanimated-carousel/commit/2982fcdcfa42852f96198f2e8e9cda48a617c705) Thanks [@dohooo](https://github.com/dohooo)! - fix: typescript error where MeasuredDimension can be null

- [#677](https://github.com/dohooo/react-native-reanimated-carousel/pull/677) [`00c948b`](https://github.com/dohooo/react-native-reanimated-carousel/commit/00c948bca03ab1aeeaff97e5f077b1b4cd61e2e4) Thanks [@nmassey](https://github.com/nmassey)! - fix Pagination.Basic and Pagination.Custom usage of TouchableWithoutFeedback.
  This fixes press event handler not working correctly. (Thanks to @qwertychouskie for reporting!)

- [#672](https://github.com/dohooo/react-native-reanimated-carousel/pull/672) [`5fa78a7`](https://github.com/dohooo/react-native-reanimated-carousel/commit/5fa78a765116d155b3fd0fabc83576e1403f13e1) Thanks [@dohooo](https://github.com/dohooo)! - revert autoPlay changes

- [#600](https://github.com/dohooo/react-native-reanimated-carousel/pull/600) [`d9557b2`](https://github.com/dohooo/react-native-reanimated-carousel/commit/d9557b21c4f275ea4ccbfa9cfd5d585464979ae8) Thanks [@dohooo](https://github.com/dohooo)! - Fixed an issue where endWithSpring used outdated data from useSharedValue after onGestureEnd, causing incorrect carousel behavior on direction reversal.

- [`85f24e7`](https://github.com/dohooo/react-native-reanimated-carousel/commit/85f24e79282e966e781b3200d2f6ed9c1de77f6e) Thanks [@dohooo](https://github.com/dohooo)! - Type error property push does not exist on type

- [#517](https://github.com/dohooo/react-native-reanimated-carousel/pull/517) [`9f3a3d6`](https://github.com/dohooo/react-native-reanimated-carousel/commit/9f3a3d6be31a251528fce89613b6308c5382fa93) Thanks [@dohooo](https://github.com/dohooo)! - Reduce the amount of work done when rendering data.

- [#496](https://github.com/dohooo/react-native-reanimated-carousel/pull/496) [`fdeef6b`](https://github.com/dohooo/react-native-reanimated-carousel/commit/fdeef6bd8355de80ea8cdb1cb334a4228819d4d2) Thanks [@dohooo](https://github.com/dohooo)! - re-calculate when window size changed in browser.

- [#597](https://github.com/dohooo/react-native-reanimated-carousel/pull/597) [`0d2b930`](https://github.com/dohooo/react-native-reanimated-carousel/commit/0d2b930f394f65fd70a03593ea8c7b16fb552e62) Thanks [@dohooo](https://github.com/dohooo)! - Adds Pagination Component

- [#666](https://github.com/dohooo/react-native-reanimated-carousel/pull/666) [`32c8c36`](https://github.com/dohooo/react-native-reanimated-carousel/commit/32c8c36c4f70885f2a49ab9156ce13e674391f4c) Thanks [@dohooo](https://github.com/dohooo)! - Add <Pagination.Custom/> dot animation.

- [#498](https://github.com/dohooo/react-native-reanimated-carousel/pull/498) [`096ac75`](https://github.com/dohooo/react-native-reanimated-carousel/commit/096ac756a28aea1ff771b046282320cdac356af8) Thanks [@dohooo](https://github.com/dohooo)! - re-calculate when window size changed in browser. (re-bump for alpha.3)

- [#577](https://github.com/dohooo/react-native-reanimated-carousel/pull/577) [`17621ca`](https://github.com/dohooo/react-native-reanimated-carousel/commit/17621ca772cc3f166094e1445253f77a0967a201) Thanks [@nmassey](https://github.com/nmassey)! - fix: make gesture onStart/onUpdate/onEnd (et al) callbacks run as worklets again

- [#733](https://github.com/dohooo/react-native-reanimated-carousel/pull/733) [`3040863`](https://github.com/dohooo/react-native-reanimated-carousel/commit/3040863506254b680e1897d2c7ac746ed56f4a39) Thanks [@dohooo](https://github.com/dohooo)! - Add pointerEvents: ‘box-none’ to ItemLayout component to allow touches for children components outside item boundaries

- [#494](https://github.com/dohooo/react-native-reanimated-carousel/pull/494) [`6b849ec`](https://github.com/dohooo/react-native-reanimated-carousel/commit/6b849ecf1ab0ce265278ec6f925b556de4d15353) Thanks [@dohooo](https://github.com/dohooo)! - Removed the reset logic when user change the defaultIndex prop. (We couldn't update the handlerOffset value when user change the defaultIndex. Because the carousel component already be a non-controlled component. So the subsequent changes of defaultIndex will be ignored.)

- [#735](https://github.com/dohooo/react-native-reanimated-carousel/pull/735) [`848f458`](https://github.com/dohooo/react-native-reanimated-carousel/commit/848f45810203d7c77077e041840179412863f0ca) Thanks [@dohooo](https://github.com/dohooo)! - This PR updates the customAnimation function signature to include an index parameter, allowing users to apply custom animations based on the item’s index.

- [#648](https://github.com/dohooo/react-native-reanimated-carousel/pull/648) [`0abdb2d`](https://github.com/dohooo/react-native-reanimated-carousel/commit/0abdb2d51fba1d309a065ed614713d792b6e70a5) Thanks [@nmassey](https://github.com/nmassey)! - fix app crash when using "onProgressChange" prop as function

- [#721](https://github.com/dohooo/react-native-reanimated-carousel/pull/721) [`2a8111e`](https://github.com/dohooo/react-native-reanimated-carousel/commit/2a8111e51762d2d716f4e4dfb18fa38c21b205a6) Thanks [@dohooo](https://github.com/dohooo)! - fix: parallax layout with new arch enabled

- [#492](https://github.com/dohooo/react-native-reanimated-carousel/pull/492) [`978b59f`](https://github.com/dohooo/react-native-reanimated-carousel/commit/978b59f0f2d8a96fe1d1de1a1c9fb205fd051cfb) Thanks [@dohooo](https://github.com/dohooo)! - feat: change the way of PanGestureHandler modification from panGestureHandlerProps to onConfigurePanGesture.

  e.g.

  ```tsx
  <Carousel
    onConfigurePanGesture={(gestureChain) => {
      gestureChain.activeOffsetX([-10, 10]);
    }}
  />
  ```

- [#528](https://github.com/dohooo/react-native-reanimated-carousel/pull/528) [`139d5e5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/139d5e5f7706e1da8800ff10b933d1010835f52f) Thanks [@dohooo](https://github.com/dohooo)! - Exported TAnimationStyle types.

- [#710](https://github.com/dohooo/react-native-reanimated-carousel/pull/710) [`d98bb99`](https://github.com/dohooo/react-native-reanimated-carousel/commit/d98bb999fce8f24b627c0c6b90a1bd2c1150364b) Thanks [@nmassey](https://github.com/nmassey)! - fix: remove shared value access warning from react-native-reanimated

- [#510](https://github.com/dohooo/react-native-reanimated-carousel/pull/510) [`b3cc591`](https://github.com/dohooo/react-native-reanimated-carousel/commit/b3cc591dcee83cf240864051018c4aa8403c3f86) Thanks [@dohooo](https://github.com/dohooo)! - Support to specific direction to auto play.

- [#703](https://github.com/dohooo/react-native-reanimated-carousel/pull/703) [`564d2f5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/564d2f5f63c3b5b934b37e8e643406ea06e1ec7e) Thanks [@dohooo](https://github.com/dohooo)! - Update homepage in package.json

- [#528](https://github.com/dohooo/react-native-reanimated-carousel/pull/528) [`b654f43`](https://github.com/dohooo/react-native-reanimated-carousel/commit/b654f439e905bc1d45f5cbb1fd291f3a82848368) Thanks [@dohooo](https://github.com/dohooo)! - Replaced 'onScrollBegin' with 'onScrollStart' to better match gesture callback.

- [`618d90d`](https://github.com/dohooo/react-native-reanimated-carousel/commit/618d90d772d4fc808d4986f2b4095a23eea5c43e) Thanks [@dohooo](https://github.com/dohooo)! - Loss of precision during arithmetic conversion

- [#576](https://github.com/dohooo/react-native-reanimated-carousel/pull/576) [`a99f069`](https://github.com/dohooo/react-native-reanimated-carousel/commit/a99f069b5c4bace6e0cf42d457d3d3363321dd7f) Thanks [@nmassey](https://github.com/nmassey)! - fix: rework code to avoid possible flicker when starting pan (panOffset race condition)

- [#724](https://github.com/dohooo/react-native-reanimated-carousel/pull/724) [`33022e6`](https://github.com/dohooo/react-native-reanimated-carousel/commit/33022e6e1fa042dffc2ae688b5cc00f62470d713) Thanks [@dohooo](https://github.com/dohooo)! - fix: next item function overscolling with overscrollEnabled is false

- [#689](https://github.com/dohooo/react-native-reanimated-carousel/pull/689) [`f935f7a`](https://github.com/dohooo/react-native-reanimated-carousel/commit/f935f7ae2f052dd0856bb11acc11f0a1945d24a8) Thanks [@dohooo](https://github.com/dohooo)! - Delete unnecessary peer denpendences

- [#510](https://github.com/dohooo/react-native-reanimated-carousel/pull/510) [`b3cc591`](https://github.com/dohooo/react-native-reanimated-carousel/commit/b3cc591dcee83cf240864051018c4aa8403c3f86) Thanks [@dohooo](https://github.com/dohooo)! - Modify the preority of windowSize settings. If you define the windowSize prop, Carousel will ignore the itemsCount. (windowSize > itemsCount)

- [#503](https://github.com/dohooo/react-native-reanimated-carousel/pull/503) [`03dba70`](https://github.com/dohooo/react-native-reanimated-carousel/commit/03dba70a857d6531eceb1ea4d2fd034e3090fe48) Thanks [@dohooo](https://github.com/dohooo)! - remove the postinstall script.

- [#560](https://github.com/dohooo/react-native-reanimated-carousel/pull/560) [`c181174`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c1811746e951ca32bf94bc2acca450fb2e58f55c) Thanks [@dohooo](https://github.com/dohooo)! - Add a new props `minScrollDistancePerSwipe` to set the minimum scroll instance to make carousel scroll.

- [#731](https://github.com/dohooo/react-native-reanimated-carousel/pull/731) [`6e8cdb4`](https://github.com/dohooo/react-native-reanimated-carousel/commit/6e8cdb4c13d447abe48c7529ee5217e39bbd0d14) Thanks [@dohooo](https://github.com/dohooo)! - improve "slow pan" behavior: if it seems that the user intent is to stay on the current page (because they didn't pan very far; maybe they started panning one direction then reversed direction, etc.), _don't_ actually change page upon gesture completion

- [#492](https://github.com/dohooo/react-native-reanimated-carousel/pull/492) [`c015873`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c015873b7a8f4f357b7342c250220ea9968d8b58) Thanks [@dohooo](https://github.com/dohooo)! - Fixed an issue where the enable props couldn't set to false.

## 4.0.0-canary.23

### Patch Changes

- [`d5de105`](https://github.com/dohooo/react-native-reanimated-carousel/commit/d5de105b977c9a2b578e97cce663d10a6bf1214f) Thanks [@dohooo](https://github.com/dohooo)! - Added missing dependencies for web to work

- [`85f24e7`](https://github.com/dohooo/react-native-reanimated-carousel/commit/85f24e79282e966e781b3200d2f6ed9c1de77f6e) Thanks [@dohooo](https://github.com/dohooo)! - Type error property push does not exist on type

- [`618d90d`](https://github.com/dohooo/react-native-reanimated-carousel/commit/618d90d772d4fc808d4986f2b4095a23eea5c43e) Thanks [@dohooo](https://github.com/dohooo)! - Loss of precision during arithmetic conversion

## 4.0.0-canary.22

### Patch Changes

- [#735](https://github.com/dohooo/react-native-reanimated-carousel/pull/735) [`848f458`](https://github.com/dohooo/react-native-reanimated-carousel/commit/848f45810203d7c77077e041840179412863f0ca) Thanks [@dohooo](https://github.com/dohooo)! - This PR updates the customAnimation function signature to include an index parameter, allowing users to apply custom animations based on the item’s index.

## 4.0.0-canary.21

### Patch Changes

- [#733](https://github.com/dohooo/react-native-reanimated-carousel/pull/733) [`3040863`](https://github.com/dohooo/react-native-reanimated-carousel/commit/3040863506254b680e1897d2c7ac746ed56f4a39) Thanks [@dohooo](https://github.com/dohooo)! - Add pointerEvents: ‘box-none’ to ItemLayout component to allow touches for children components outside item boundaries

## 4.0.0-canary.20

### Patch Changes

- [#731](https://github.com/dohooo/react-native-reanimated-carousel/pull/731) [`6e8cdb4`](https://github.com/dohooo/react-native-reanimated-carousel/commit/6e8cdb4c13d447abe48c7529ee5217e39bbd0d14) Thanks [@dohooo](https://github.com/dohooo)! - improve "slow pan" behavior: if it seems that the user intent is to stay on the current page (because they didn't pan very far; maybe they started panning one direction then reversed direction, etc.), _don't_ actually change page upon gesture completion

## 4.0.0-canary.19

### Patch Changes

- [#724](https://github.com/dohooo/react-native-reanimated-carousel/pull/724) [`33022e6`](https://github.com/dohooo/react-native-reanimated-carousel/commit/33022e6e1fa042dffc2ae688b5cc00f62470d713) Thanks [@dohooo](https://github.com/dohooo)! - fix: next item function overscolling with overscrollEnabled is false

## 4.0.0-canary.18

### Patch Changes

- [#721](https://github.com/dohooo/react-native-reanimated-carousel/pull/721) [`2a8111e`](https://github.com/dohooo/react-native-reanimated-carousel/commit/2a8111e51762d2d716f4e4dfb18fa38c21b205a6) Thanks [@dohooo](https://github.com/dohooo)! - fix: parallax layout with new arch enabled

- [#710](https://github.com/dohooo/react-native-reanimated-carousel/pull/710) [`d98bb99`](https://github.com/dohooo/react-native-reanimated-carousel/commit/d98bb999fce8f24b627c0c6b90a1bd2c1150364b) Thanks [@nmassey](https://github.com/nmassey)! - fix: remove shared value access warning from react-native-reanimated

## 4.0.0-canary.17

### Patch Changes

- [#703](https://github.com/dohooo/react-native-reanimated-carousel/pull/703) [`564d2f5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/564d2f5f63c3b5b934b37e8e643406ea06e1ec7e) Thanks [@dohooo](https://github.com/dohooo)! - Update homepage in package.json

## 4.0.0-canary.16

### Patch Changes

- [#687](https://github.com/dohooo/react-native-reanimated-carousel/pull/687) [`55c55ff`](https://github.com/dohooo/react-native-reanimated-carousel/commit/55c55ff8304159ab2949b0335ac34411030b94b7) Thanks [@dohooo](https://github.com/dohooo)! - feat: Add containerStyle prop to control the container styles.

- [#689](https://github.com/dohooo/react-native-reanimated-carousel/pull/689) [`f935f7a`](https://github.com/dohooo/react-native-reanimated-carousel/commit/f935f7ae2f052dd0856bb11acc11f0a1945d24a8) Thanks [@dohooo](https://github.com/dohooo)! - Delete unnecessary peer denpendences

## 4.0.0-canary.15

### Patch Changes

- [#677](https://github.com/dohooo/react-native-reanimated-carousel/pull/677) [`00c948b`](https://github.com/dohooo/react-native-reanimated-carousel/commit/00c948bca03ab1aeeaff97e5f077b1b4cd61e2e4) Thanks [@nmassey](https://github.com/nmassey)! - fix Pagination.Basic and Pagination.Custom usage of TouchableWithoutFeedback.
  This fixes press event handler not working correctly. (Thanks to @qwertychouskie for reporting!)

## 4.0.0-canary.14

### Patch Changes

- [#672](https://github.com/dohooo/react-native-reanimated-carousel/pull/672) [`5fa78a7`](https://github.com/dohooo/react-native-reanimated-carousel/commit/5fa78a765116d155b3fd0fabc83576e1403f13e1) Thanks [@dohooo](https://github.com/dohooo)! - revert autoPlay changes

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
