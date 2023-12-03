---
'react-native-reanimated-carousel': patch
---

feat: change the way of PanGestureHandler modification from panGestureHandlerProps to onConfigurePanGesture.

e.g.

```tsx
<Carousel
 onConfigurePanGesture={gestureChain => {
    gestureChain.activeOffsetX([-10, 10])
 }}
/>
```
