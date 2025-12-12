---
"react-native-reanimated-carousel": minor
---

# Deprecate width/height props in favor of style-based sizing

## Changes

### Deprecated Props
- `width` and `height` props are now deprecated. Use `style={{ width: ..., height: ... }}` instead
- `defaultScrollOffsetValue` is deprecated in favor of `scrollOffsetValue`

### New Behavior
- Carousel now prioritizes dimensions from `style` prop over legacy `width`/`height` props
- When both `style` and legacy props are provided, `style` takes precedence

### Migration

**Before (v4 style):**
```tsx
<Carousel width={300} height={200} />
```

**After (v5 style):**
```tsx
<Carousel style={{ width: 300, height: 200 }} />
```

**Scroll offset:**
```tsx
// Before
<Carousel defaultScrollOffsetValue={sharedValue} />

// After
<Carousel scrollOffsetValue={sharedValue} />
```

### Notes
- Legacy props remain functional for backwards compatibility
- Console warnings will guide migration in development mode
- Full removal planned for next major version
