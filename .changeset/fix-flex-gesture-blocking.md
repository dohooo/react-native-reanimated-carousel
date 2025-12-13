---
"react-native-reanimated-carousel": patch
---

# Fix gesture blocking when using flex-based sizing

## Bug Fixes

### Gesture Blocking with `flex: 1`
Fixed an issue where gestures were blocked or delayed when using `style={{ flex: 1 }}` instead of explicit `width`/`height` props.

**Root Cause:** Race condition between `sizeReady` (SharedValue, updates immediately on UI thread) and `size` (React state, updates asynchronously). When `sizeReady` became `true`, the React state `size` was still `0`, causing gesture handlers to incorrectly block input.

**Solution:** All worklet functions now use `resolvedSize.value` (SharedValue) instead of React state `size` to ensure consistent synchronization on the UI thread.

### itemWidth/itemHeight Not Working
Fixed an issue where `itemWidth`/`itemHeight` props were being ignored - items rendered at container width instead of the specified item dimensions.

**Root Cause:** `ItemLayout.tsx` was prioritizing `style.width` over `itemWidth` prop.

**Solution:** Now correctly prioritizes explicit `itemWidth`/`itemHeight` props for item sizing.

## Affected Files
- `src/components/ScrollViewGesture.tsx` - Fixed race condition in gesture handlers
- `src/components/ItemLayout.tsx` - Fixed itemWidth/itemHeight priority
