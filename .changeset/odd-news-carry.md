---
"react-native-reanimated-carousel": minor
---

## ✨ Style API refresh

- `style` now controls the outer carousel container (positioning, width/height, margins).
- New `contentContainerStyle` replaces `containerStyle` for styling the scrollable content.
- `width` and `height` props are deprecated; define size via `style` instead.

### Migration Example

```tsx
// Before
<Carousel
  width={300}
  height={200}
  containerStyle={{ paddingHorizontal: 16 }}
/>

// After
<Carousel
  style={{ width: 300, height: 200 }}
  contentContainerStyle={{ paddingHorizontal: 16 }}
/>
```

- Any layout logic still works; simply move `width`/`height` into `style` and container tweaks into `contentContainerStyle`.
- `contentContainerStyle` runs on the JS thread—avoid adding `opacity` / `transform` there if you rely on built-in animations.
