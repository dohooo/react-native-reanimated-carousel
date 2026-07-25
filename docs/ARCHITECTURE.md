# Architecture

This document describes the v5 architecture and its public-contract invariants. Public API details belong in `example/website/pages/props.mdx`; migration behavior belongs in `example/website/pages/migration-v5.mdx`.

## Goals

The implementation is organized around a small set of invariants:

1. Public indices always refer to the raw `data` array.
2. Forward navigation has one logical sign across orientation and RTL.
3. Visual position is continuous; public selection changes only on settle.
4. Loop copies, physical direction, and rendering-window indices never leak through the API.
5. UI-thread state stays in SharedValues; JS callbacks cross threads explicitly.
6. Only stable root exports are published.

## Public boundary

`src/index.tsx` exports two runtime values:

```ts
export { Carousel } from "./components/Carousel";
export { Pagination } from "./components/Pagination";
```

It also exports the types defined in `src/public-types.ts`:

```text
CarouselProps<Item>
CarouselRef
CarouselRenderItem<Item>
CarouselRenderItemInfo<Item>
CarouselProgressChangeHandler
CarouselLayout
CarouselAnimation
CarouselItemAnimation
CarouselPanGesture
CarouselStepOptions
CarouselScrollToOptions
PaginationProps
PaginationDotStyle
```

The package has no default runtime export. `package.json#exports` exposes only `.` and `./package.json`; deep imports are unsupported.

## Component tree

```text
Carousel
└── GlobalStateProvider
    └── CarouselLayout
        └── ScrollViewGesture
            └── ItemRenderer
                └── ItemLayout × mounted item
                    └── renderItem result
```

- `Carousel` initializes public props and supplies internal stores.
- `CarouselLayout` coordinates progress, controller, autoplay, measurement, and lifecycle.
- `ScrollViewGesture` owns pan and settle physics.
- `ItemRenderer` maps internal copies back to raw items and applies the render window.
- `ItemLayout` computes bounded per-item relative progress, animated style, size, and accessibility state.

`Pagination` is independent. It consumes the same logical `progress` SharedValue but owns no Carousel state or ref.

## Initialization and measurement

`useInitProps` resolves stable defaults:

```text
defaultIndex       0
loop               false
autoplay           false
autoplayInterval   3000ms
autoplayDirection  forward
orientation        horizontal
scrollEnabled      true
snapMode           page
overscrollEnabled  true
animation          timing / 500ms / easeOutQuart
```

The root `style` controls viewport dimensions. `itemSize` optionally overrides the main-axis page distance; otherwise the measured viewport main axis is used.

The size state has explicit readiness. Commands, gestures, autoplay, progress, and transforms stay neutral until a finite positive size is available.

At first size readiness, Carousel initializes translation to:

```ts
-defaultIndex * itemSize
```

This write occurs even when the consumer supplied `scrollOffsetValue`.

### `defaultIndex`

- Mount with non-empty data: an invalid index throws synchronously.
- Mount with empty data: validation is deferred to the first non-empty data commit.
- Deferred invalid index: warn in development and use `0`; never throw from the update path.

## Data model and identity

`rawData` is the consumer array. Loop mode may fill arrays with one or two items so rendering has enough physical copies:

```text
[A]    -> [A, A, A]
[A,B]  -> [A, B, A, B]
```

These copies are internal. `computedRealIndexWithAutoFillData` maps every render and callback back to a raw-data index.

`keyExtractor` produces stable raw identity. Internal copies append a library-owned copy suffix, preserving React key uniqueness without exposing copy indices.

### Reconciliation

Data changes are reconciled by `useCommonVariables`:

1. If `keyExtractor` identifies the previous selected item in new data, keep it.
2. Otherwise clamp the previous numeric index.
3. If movement is active, defer the correction until settle.
4. Apply offset and selection correction without lifecycle callbacks.
5. A length change may rebase public loop progress once.

Empty data stays neutral:

```text
index = 0
progress = 0
offset = 0
navigation/autoplay/callbacks = no-op
```

## Coordinate systems

### Content translation

`handlerOffset` is the canonical motion SharedValue and is expressed in signed main-axis pixels:

```text
item 0:  0
item 1: -itemSize
item 2: -2 * itemSize
```

Loop translation is intentionally unbounded. Rendering paths derive bounded modulo values before passing transforms to native views.

If supplied, `scrollOffsetValue` is the same SharedValue as `handlerOffset`. It is two-way:

- the library writes during gestures and animations;
- an external write moves content;
- a direct write cancels an in-flight animation;
- a canceled command does not settle and does not fire `onSnapToItem`;
- a direct write does not commit selection;
- active gesture frames own the value and can overwrite external writes.

### Logical progress

`getLogicalProgress(offset, itemSize)` converts translation into fractional logical index:

```ts
progress = -offset / itemSize
```

Forward is positive. Non-loop progress is clamped; loop progress stays continuous and unbounded.

`useOnProgressChange` writes the `progress` SharedValue on the UI thread and optionally schedules the same number to the JS `onProgressChange` callback.

### Relative item progress

`useOffsetX` computes the nearest physical copy for an item and `ItemLayout` divides that bounded distance by item size:

```text
backward item  -1
selected item   0
forward item   +1
```

The resulting `relativeProgress` drives both the outer `itemAnimation` and the SharedValue passed to `renderItem`.

## Selection and controller

`useCarouselController` keeps separate state for:

- live visual page/index, used by rendering and command baselines;
- settled raw index, exposed by `getCurrentIndex()`.

The public index remains latched throughout an in-flight gesture or animation.

### Commands

- `next` and `prev` accept positive-integer counts.
- `scrollTo` accepts one absolute in-range raw index.
- commands default to animated.
- non-loop commands clamp movement at the logical boundary.
- loop `next`/`prev` preserve their requested direction.
- loop `scrollTo` chooses the shortest route and logical forward on a tie.
- rejected and no-op commands emit no lifecycle callbacks.
- accepted non-animated commands emit start and settle immediately.

The command baseline is the nearest current visual page, not the settled index. This preserves intuitive behavior after external offset writes.

## Movement lifecycle

The internal movement state prevents duplicate start/settle transitions.

`onScrollStart` is scheduled on JS once for an accepted movement from:

- pan gesture;
- `next`;
- `prev`;
- `scrollTo`;
- autoplay.

When motion stops, the nearest raw index becomes settled and `onSnapToItem` is scheduled on JS. With `snapMode="none"`, the callback name still means “movement settled at the nearest logical item,” not necessarily that a snap animation ran.

Relayout, data reconciliation, direct offset writes, and rejected commands do not emit lifecycle events.

## Gesture architecture

`usePanGestureProxy` creates a real RNGH `PanGesture`. It temporarily captures consumer lifecycle observers, restores the real builder methods, and installs one composed handler per event.

Order:

```text
Carousel-owned worklet handler
consumer worklet observer
```

Other supported builder calls configure the real gesture directly.

The public `CarouselPanGesture` interface is handwritten. Chained methods return the narrow facade, preventing polymorphic `this` from re-exposing ownership-changing RNGH methods. It intentionally excludes:

- `enabled` — owned by reactive `scrollEnabled`;
- `runOnJS` — observers use worklets and explicit `scheduleOnRN`;
- `manualActivation` — would bypass Carousel's state machine.

## Snap and animation

`snapMode` selects gesture release behavior:

- `page`: one-page movement;
- `nearest`: nearest logical page;
- `none`: free decay, then nearest-index settle.

`dealWithAnimation` maps the flat `CarouselAnimation` union to Reanimated timing or spring configuration. The same animation config controls gesture snapping, commands, and autoplay. Free decay and overscroll rebound remain internal.

No hidden duration is added. Reanimated supplies system-aware reduced-motion behavior.

## Autoplay

`useAutoPlay` is a small controlled scheduler:

1. Wait `autoplayInterval` after the previous settle.
2. Call `next` or `prev`.
3. Wait for movement to finish.
4. Arm the next dwell.

The interval is settled dwell, not a wall-clock period including animation.

Autoplay pauses during user interaction or any in-flight transition. With `loop={false}`, a rejected boundary command ends the chain. A relevant prop or data update can arm it again.

`scrollEnabled` affects pan input only and does not stop autoplay or commands.

## Layouts and animation styles

`useLayoutConfig` resolves one `CarouselItemAnimation`:

- normal layout when neither `layout` nor `itemAnimation` is provided;
- `parallax`, `horizontal-stack`, or `vertical-stack` from `layout`;
- consumer `itemAnimation` when provided.

The public XOR rejects `layout` plus `itemAnimation`. Runtime validation protects untyped JavaScript.

Current built-in defaults:

```text
parallax:
  offset        100
  scale         0.8
  adjacentScale scale²

stack:
  visibleCount  rawDataLength - 1
  exitDistance  screen width
  spacing       18
  scaleStep     0.04
  opacityStep   0.1
  rotation      30
  exitDirection left
```

`sanitizeAnimationStyle` removes unsafe animation output and normalizes `zIndex`.

## RTL

`getCarouselDirectionSign` is the only logical-to-physical direction source:

```text
horizontal LTR  +1
horizontal RTL  -1
vertical        +1
```

Public coordinates never change. Horizontal physical pan translation and velocity are normalized before entering motion math. Normal, parallax, and horizontal-stack layouts map logical output back to physical x values.

The matrix is covered as pure functions before UI integration:

```text
LTR/RTL
× loop/non-loop
× gesture/command/autoplay
× normal/parallax/stack
```

Consumer gesture observers still receive raw physical RNGH events. `exitDirection` is always physical. Consumer `itemAnimation` receives logical progress but returns physical React Native transforms, so custom horizontal x-direction effects own RTL mirroring.

## Render window

`useVisibleRanges` derives mounted ranges from live translation. `renderWindowSize` is normalized to a positive count and clamped to raw data length; omission mounts all raw slides.

`ItemRenderer` returns `null` outside current ranges. The optimization does not affect navigation, coordinates, identity, or lifecycle.

## Accessibility

`ItemLayout` marks only the current physical slide visible to accessibility services:

```text
accessibilityElementsHidden
aria-hidden
importantForAccessibility
```

The application owns semantic labels and controls inside `renderItem`.

Pagination behavior is conditional:

- with `onPress`: `Pressable` buttons, selected state, default or custom label;
- without `onPress`: decorative views hidden from the accessibility tree.

## Pagination math

Pagination receives raw `count` and read-only logical `progress`.

For each dot, `getNearestLoopPosition` chooses the equivalent `index + k * count` nearest to current progress. Distance then drives numeric size, border, color, and opacity interpolation.

This model supports forward, backward, and arbitrarily many cycles without a `loop` prop or a first-dot seam branch.

## Thread boundaries

UI thread / worklets:

- `handlerOffset`, `progress`, `relativeProgress`;
- motion, visible ranges, layout transforms, item animation;
- gesture handlers and consumer gesture observers;
- Pagination interpolation.

JS thread:

- React rendering, `renderItem`, `keyExtractor`;
- `onConfigurePanGesture` configuration call;
- refs and public lifecycle/progress callbacks;
- `onLayout`, Pagination presses, accessibility label factory.

Cross-thread calls use `scheduleOnRN` or `scheduleOnUI` explicitly.

## Packaging

Bob builds:

```text
lib/commonjs
lib/module
lib/typescript/commonjs
lib/typescript/module
```

Top-level `main`, `module`, `types`, and `react-native` fields remain for older resolvers. Conditional `exports` route ESM, CommonJS, React Native source, and their declaration files.

Packaging checks run against built and packed artifacts:

- runtime export and exact type whitelist;
- no default export;
- CommonJS and ESM resolution;
- TypeScript Node-style and bundler resolution;
- Jest resolution;
- deep-import rejection;
- tarball content allowlist;
- Expo packed consumers and Web smoke tests.

## Validation strategy

The contract is protected at several levels:

- TypeScript project checks plus compile-time positive/negative fixtures;
- Jest behavior, lifecycle, data reconciliation, gesture, RTL, accessibility, and numeric-soak tests;
- example application type checking;
- packed package entry and consumer checks;
- Playwright Web smoke tests;
- Expo compatibility builds;
- Maestro native E2E where simulator/emulator infrastructure is available.
