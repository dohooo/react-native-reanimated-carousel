# react-native-reanimated-carousel

## 4.0.0-alpha.6

### Minor Changes

-   [#507](https://github.com/dohooo/react-native-reanimated-carousel/pull/507) [`c6d58e5`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c6d58e5f099145b1d74a18c4b73a5d3dc1c515e3) Thanks [@dohooo](https://github.com/dohooo)! - Support to fix the scroll direction through new API, fixedDirection.

### Patch Changes

-   [#507](https://github.com/dohooo/react-native-reanimated-carousel/pull/507) [`353fdce`](https://github.com/dohooo/react-native-reanimated-carousel/commit/353fdce59c1b38796801e4180f6ac8dde879f936) Thanks [@dohooo](https://github.com/dohooo)! - remove postinstall script.

## 4.0.0-alpha.5

### Patch Changes

-   [#503](https://github.com/dohooo/react-native-reanimated-carousel/pull/503) [`03dba70`](https://github.com/dohooo/react-native-reanimated-carousel/commit/03dba70a857d6531eceb1ea4d2fd034e3090fe48) Thanks [@dohooo](https://github.com/dohooo)! - remove the postinstall script.

## 4.0.0-alpha.4

### Patch Changes

-   [#498](https://github.com/dohooo/react-native-reanimated-carousel/pull/498) [`096ac75`](https://github.com/dohooo/react-native-reanimated-carousel/commit/096ac756a28aea1ff771b046282320cdac356af8) Thanks [@dohooo](https://github.com/dohooo)! - re-calculate when window size changed in browser. (re-bump for alpha.3)

## 4.0.0-alpha.3

### Patch Changes

-   [#496](https://github.com/dohooo/react-native-reanimated-carousel/pull/496) [`fdeef6b`](https://github.com/dohooo/react-native-reanimated-carousel/commit/fdeef6bd8355de80ea8cdb1cb334a4228819d4d2) Thanks [@dohooo](https://github.com/dohooo)! - re-calculate when window size changed in browser.

## 4.0.0-alpha.2

### Patch Changes

-   [#494](https://github.com/dohooo/react-native-reanimated-carousel/pull/494) [`6b849ec`](https://github.com/dohooo/react-native-reanimated-carousel/commit/6b849ecf1ab0ce265278ec6f925b556de4d15353) Thanks [@dohooo](https://github.com/dohooo)! - Removed the reset logic when user change the defaultIndex prop. (We couldn't update the handlerOffset value when user change the defaultIndex. Because the carousel component already be a non-controlled component. So the subsequent changes of defaultIndex will be ignored.)

## 4.0.0-alpha.1

### Patch Changes

-   [#492](https://github.com/dohooo/react-native-reanimated-carousel/pull/492) [`978b59f`](https://github.com/dohooo/react-native-reanimated-carousel/commit/978b59f0f2d8a96fe1d1de1a1c9fb205fd051cfb) Thanks [@dohooo](https://github.com/dohooo)! - feat: change the way of PanGestureHandler modification from panGestureHandlerProps to onConfigurePanGesture.

    e.g.

    ```tsx
    <Carousel
        onConfigurePanGesture={(gestureChain) => {
            gestureChain.activeOffsetX([-10, 10]);
        }}
    />
    ```

-   [#492](https://github.com/dohooo/react-native-reanimated-carousel/pull/492) [`c015873`](https://github.com/dohooo/react-native-reanimated-carousel/commit/c015873b7a8f4f357b7342c250220ea9968d8b58) Thanks [@dohooo](https://github.com/dohooo)! - Fixed an issue where the enable props couldn't set to false.

## 4.0.0-alpha.0

### Major Changes

-   56e20c8: feat: use new RNGH api

    Updates `react-native-gesture-handler` to `>=2.9.0` and replaces usage of `useAnimatedGestureHandler` with the [new gesture handler API](https://docs.swmansion.com/react-native-gesture-handler/docs/#rngh-20) which supports the [new gesture handler web implementation](https://github.com/software-mansion/react-native-gesture-handler/pull/2157).

## 3.5.1

### Patch Changes

-   870b130: Fixed ref unsable issue.

## 3.5.0

### Minor Changes

-   c117a3a: Reducing default seetings for Android. (gestureHandlerRootHOC)

## 3.4.0

### Minor Changes

-   8ea24ca: Added `maxScrollDistancePerSwipe` props.

## 3.3.2

### Patch Changes

-   0237ae8: Solved the crush issue.

## 3.3.1

### Patch Changes

-   b09fb81: chore: only push the lib to npm.

## 3.3.0

### Minor Changes

-   677b37b: 🚀 Support to test.

## 3.2.0

### Minor Changes

-   01184e9: 🚀 Add new props `overscrollEnabled` to support scrolling management.
