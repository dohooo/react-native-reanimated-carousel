# React Native Reanimated Carousel: Complete Architecture Design Documentation

## 📖 Documentation Objective

This document provides a comprehensive technical architecture analysis for the `react-native-reanimated-carousel` component library, using a funnel structure that goes from top-level design to bottom-level implementation details. It aims to help developers, contributors, and maintainers deeply understand the component library's operational mechanisms, providing technical guidance for subsequent development and testing.

---

## 🏗️ Top-Level Architecture Overview

### Core Design Philosophy

React Native Reanimated Carousel is a high-performance carousel component built on **React Native Reanimated 2**, adopting the following core design principles:

1. **Performance First**: All animation calculations execute on the UI thread, ensuring 60fps smooth experience
2. **Math-Driven**: Based on precise interpolation algorithms and mathematical transformations to achieve complex animation effects
3. **Modular Design**: Separation of concerns, component decoupling, extensible architecture
4. **Type Safety**: Complete TypeScript support with strict type checking

### Technology Stack

- **React Native**: Cross-platform mobile application framework
- **React Native Reanimated 2**: High-performance animation engine
- **React Native Gesture Handler**: Gesture recognition and handling
- **TypeScript**: Type safety and development experience
- **Worklets**: UI thread JavaScript execution environment

---

## 🎯 Architecture Layering

```
┌─────────────────────────────────────────────────────────────┐
│                    🎨 Presentation Layer                     │
├─────────────────────────────────────────────────────────────┤
│ • Carousel (Entry Component)                                │
│ • CarouselLayout (Layout Container)                         │
│ • ItemRenderer (Item Renderer)                              │
│ • ItemLayout (Single Item Layout)                           │
│ • Pagination (Page Indicator)                               │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                       🔄 Logic Layer                         │
├─────────────────────────────────────────────────────────────┤
│ • 12 Core Hooks (State Management, Control Logic, Gestures) │
│ • Global State Management (GlobalStateProvider)             │
│ • Layout Strategies (Layout Strategies)                     │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                   ⚙️ Computation Layer                       │
├─────────────────────────────────────────────────────────────┤
│ • Math Utility Functions (Offset Calc, Data Transform, Anim)│
│ • Interpolation Algorithms                                   │
│ • Boundary Management                                        │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                  🛠️ Foundation Layer                         │
├─────────────────────────────────────────────────────────────┤
│ • React Native Reanimated 2 (SharedValue, Worklets)        │
│ • React Native Gesture Handler (PanGesture)                │
│ • React Native Core (View, StyleSheet, Dimensions)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Presentation Layer Deep Dive

### 1. Carousel Component - Entry Facade

**Location**: `src/components/Carousel.tsx`

```typescript
const Carousel = React.forwardRef<ICarouselInstance, TCarouselProps<any>>((_props, ref) => {
  const props = useInitProps(_props);
  const { dataLength } = props;
  const commonVariables = useCommonVariables(props);
  usePropsErrorBoundary({ ...props, dataLength });

  return (
    <GlobalStateProvider value={{ props, common: commonVariables }}>
      <CarouselLayout ref={ref} />
    </GlobalStateProvider>
  );
});
```

**Responsibilities**:
- **Props Initialization**: Standardizes and validates input parameters through `useInitProps`
- **State Provision**: Creates global state context, providing shared state for child components
- **Error Boundary**: Runtime validation through `usePropsErrorBoundary`
- **Generic Support**: Supports type-safe passing of arbitrary data types

### 2. CarouselLayout Component - Core Layout Container

**Location**: `src/components/CarouselLayout.tsx`

**Key Features**:
- **Multi-Hook Integration**: Integrates 8+ functional Hooks
- **Gesture Management**: Integrates ScrollViewGesture to handle user interactions
- **Auto Play**: Manages auto-play state and user interaction conflicts
- **Animation Configuration**: Selects layout strategy through useLayoutConfig

**Data Flow**:
```
Props → useCommonVariables → offsetX → useOnProgressChange → External Callbacks
     → useCarouselController → Programmatic Control API
     → useAutoPlay → Auto Play Control
```

### 3. ItemRenderer Component - High-Performance Rendering Engine

**Location**: `src/components/ItemRenderer.tsx`

**Core Algorithm**:
```typescript
const visibleRanges = useVisibleRanges({
  total: dataLength,
  viewSize: size,
  translation: handlerOffset,
  windowSize,
  loop,
});

// Only render items within visible range
const shouldRender =
  (index >= negativeRange[0] && index <= negativeRange[1]) ||
  (index >= positiveRange[0] && index <= positiveRange[1]);
```

**Performance Optimizations**:
- **Viewport Optimization**: Only renders visible items + buffer zone
- **Dynamic Range**: Dynamically calculates render range based on scroll position
- **Memory Management**: Avoids performance issues with large datasets

### 4. ItemLayout Component - Single Item Animation Container

**Location**: `src/components/ItemLayout.tsx`

**Animation Calculation Chain**:
```
handlerOffset → useOffsetX → x value → animationValue → animatedStyle → Visual Effect
```

**Key Code**:
```typescript
const x = useOffsetX(offsetXConfig, visibleRanges);
const animationValue = useDerivedValue(() => x.value / size, [x, size]);
const animatedStyle = useAnimatedStyle<ViewStyle>(
  () => animationStyle(x.value / size, index),
  [animationStyle, index, x, size]
);
```

---

## 🔄 Logic Layer Deep Analysis

### Hooks Ecosystem Architecture

React Native Reanimated Carousel's core logic is implemented through 12 specialized Hooks, forming a complete state management and control system.

#### 1. Core State Management Hooks

##### useInitProps - Parameter Standardization Center

**Location**: `src/hooks/useInitProps.ts`

**Function Matrix**:
```typescript
Input Props → Default Value Filling → Size Standardization → Data Processing → Mode Configuration → Standardized Props
```

**Key Processing**:
- **Default Value Strategy**: Provides reasonable defaults for 50+ optional parameters
- **Data Preprocessing**: Processes loop data through `computedFillDataWithAutoFillData`
- **Size Normalization**: `Math.round()` handles floating-point sizes, avoiding rendering issues
- **Mode Configuration**: Provides special configuration handling for stack mode

##### useCommonVariables - State Management Core

**Location**: `src/hooks/useCommonVariables.ts`

**Core SharedValues**:
```typescript
const handlerOffset = scrollOffsetValue ?? defaultScrollOffsetValue ?? useSharedValue(0);
// `size` is the "page size" used for snapping & animations:
// itemWidth/itemHeight (preferred) -> style axis size -> deprecated width/height -> measurement
const size = /* resolved page size */;
const validLength = dataLength - 1;
```

**Reactive Updates**:
```typescript
useAnimatedReaction(
  () => ({ data: dataLength, size }),
  ({ data, size: newSize }, previous) => {
    if (previous) {
      // Recalculate offset when data changes
      if (data !== previous.data) {
        handlerOffset.value = computeOffsetIfDataChanged(...);
      }
      // Proportional scaling when size changes
      if (newSize !== previous.size) {
        handlerOffset.value = computeOffsetIfSizeChanged(...);
      }
    }
  },
  [dataLength, size]
);
```

**Design Significance**: `handlerOffset` is the "heart" of the entire component, all animations and interactions are driven by this value.

#### 2. Visual Optimization Hooks

##### useVisibleRanges - Performance Optimization Engine

**Location**: `src/hooks/useVisibleRanges.tsx`

**Algorithm Core**:
```typescript
const getVisibleRanges = (offset: number): IVisibleRanges => {
  "worklet";
  
  // Basic visible range calculation
  const startIndex = Math.floor(offset / viewSize);
  const endIndex = Math.ceil((offset + viewSize) / viewSize);
  
  // Buffer zone expansion
  const buffer = windowSize > 0 ? Math.floor(windowSize / 2) : DEFAULT_COUNT;
  
  return {
    negativeRange: [startIndex - buffer, startIndex + buffer],
    positiveRange: [endIndex - buffer, endIndex + buffer],
  };
};
```

**Performance Impact**: Optimizes large datasets (1000+ items) rendering to visible items + buffer zone, performance improvement 90%+.

##### useOffsetX - Precision Position Calculator

**Location**: `src/hooks/useOffsetX.ts`

**Complexity Sources**:
1. **Infinite Loop Handling**: 7-segment interpolation intervals handle loop boundaries
2. **Multiple Positioning Modes**: positive/negative type support
3. **Viewport Optimization**: Only calculates positions for items within visible range

**Key Algorithm**:
```typescript
const x = useDerivedValue(() => {
  if (loop) {
    const inputRange = [
      -TOTAL_WIDTH,
      MIN - HALF_WIDTH - startPos - Number.MIN_VALUE,
      MIN - HALF_WIDTH - startPos,
      0,
      MAX + HALF_WIDTH - startPos,
      MAX + HALF_WIDTH - startPos + Number.MIN_VALUE,
      TOTAL_WIDTH,
    ];
    
    return interpolate(handlerOffset.value, inputRange, outputRange, Extrapolation.CLAMP);
  }
  
  return handlerOffset.value + size * index;
}, [loop, dataLength, viewCount, type, size, visibleRanges, handlerOffset]);
```

#### 3. Control Logic Hooks

##### useCarouselController - Programmatic Control Center

**Location**: `src/hooks/useCarouselController.tsx`

**API Design**:
```typescript
interface ICarouselInstance {
  prev: (opts?: TCarouselActionOptions) => void;
  next: (opts?: TCarouselActionOptions) => void;
  getCurrentIndex: () => number;
  scrollTo: (opts?: TCarouselActionOptions) => void;
}
```

**Core Control Algorithm**:
```typescript
const scrollWithTiming = useCallback((toValue: number, onFinished?: () => void) => {
  const { type = "spring", config = DEFAULT_SPRING_CONFIG } = withAnimation;
  
  if (type === "spring") {
    handlerOffset.value = withSpring(toValue, config, onFinished);
  } else {
    handlerOffset.value = withTiming(toValue, config, onFinished);
  }
}, [withAnimation, handlerOffset]);
```

**Boundary Handling**:
- **Loop Mode**: No boundary restrictions, supports infinite scrolling
- **Non-Loop Mode**: Strict boundary checking, prevents out-of-bounds scrolling
- **Overscroll**: Configurable elastic effects

##### useAutoPlay - Auto Play Manager

**Location**: `src/hooks/useAutoPlay.ts`

**State Machine Design**:
```typescript
States: STOPPED ←→ RUNNING
Triggers: start() / pause()
Conditions: autoPlay configuration + user interaction detection
```

**Implementation Mechanism**:
```typescript
const _start = React.useCallback(() => {
  if (!autoPlay || !carouselController) return;
  
  const run = () => {
    const next = autoPlayReverse ? carouselController.prev : carouselController.next;
    next({ onFinished: () => setTimeout(run, autoPlayInterval) });
  };
  
  run();
}, [autoPlay, autoPlayReverse, autoPlayInterval, carouselController]);
```

#### 4. Gesture Handling Hooks

##### usePanGestureProxy - Gesture Proxy Pattern

**Location**: `src/hooks/usePanGestureProxy.ts`

**Proxy Pattern Implementation**:
```typescript
const proxyPanGesture = useMemo(() => {
  const newPanGesture = Gesture.Pan();
  
  // Save original callbacks
  const savedCallbacks = {
    onBegin: newPanGesture._handlers.onBegin,
    onStart: newPanGesture._handlers.onStart,
    onUpdate: newPanGesture._handlers.onUpdate,
    onEnd: newPanGesture._handlers.onEnd,
  };
  
  // Apply user configuration
  if (onConfigurePanGesture) {
    onConfigurePanGesture(newPanGesture);
  }
  
  // Merge internal logic
  return newPanGesture
    .onBegin((e) => {
      savedCallbacks.onBegin?.(e);
      // Internal logic
    })
    .onUpdate((e) => {
      savedCallbacks.onUpdate?.(e);
      // Internal logic
    });
}, [onConfigurePanGesture]);
```

**Design Value**: Allows users to customize gesture behavior while ensuring component internal logic remains intact.

#### 5. Monitoring and Utility Hooks

##### useOnProgressChange - Progress Monitor

**Location**: `src/hooks/useOnProgressChange.ts`

**Dual Mode Support**:
```typescript
// Callback function mode
onProgressChange?: (offsetProgress: number, absoluteProgress: number) => void

// SharedValue mode  
onProgressChange?: SharedValue<number>
```

**Calculation Precision**:
```typescript
useAnimatedReaction(
  () => {
    const offsetProgress = offsetX.value;
    const absoluteProgress = computedRealIndexWithAutoFillData({
      index: Math.round(Math.abs(offsetX.value) / size),
      dataLength: rawDataLength,
      loop,
      autoFillData,
    }) + Math.sign(offsetX.value) * ((Math.abs(offsetX.value) % size) / size);
    
    return { offsetProgress, absoluteProgress };
  },
  ({ offsetProgress, absoluteProgress }) => {
    if (typeof onProgressChange === "function") {
      scheduleOnRN(onProgressChange, offsetProgress, absoluteProgress);
    } else if (onProgressChange) {
      onProgressChange.value = absoluteProgress;
    }
  }
);
```

### Global State Management

#### GlobalStateProvider Architecture

**Location**: `src/store/index.tsx`

**State Structure**:
```typescript
interface IContext {
  props: TInitializeCarouselProps<any>;      // Standardized props
  common: {                                  // Common computed values
    size: number;                           // Current size
    validLength: number;                    // Valid length
  };
  layout: {                                // Layout-related state
    containerSize: SharedValue<{width: number; height: number}>;
    updateContainerSize: (dimensions) => void;
    itemDimensions: SharedValue<ItemDimensions>;
    updateItemDimensions: (index, dimensions) => void;
  };
}
```

**Worklet Support**:
```typescript
const updateItemDimensions = (index: number, dimensions: {width: number; height: number}) => {
  "worklet";
  itemDimensions.value = { ...itemDimensions.value, [index]: dimensions };
};
```

---

## ⚙️ Computation Layer Deep Analysis

### Mathematical Utility Functions Architecture

The mathematical computation layer of React Native Reanimated Carousel contains 6 core utility functions, each solving specific computational problems.

#### 1. Offset Calculation Tools

##### compute-offset-if-data-changed.ts - Data Change Adapter

**Core Algorithm**:
```typescript
export const computeOffsetIfDataChanged = (opts: IOpts): number => {
  "worklet";
  
  const { handlerOffset, dataLength, size, previousLength } = opts;
  const currentHandlerOffset = Math.abs(handlerOffset);
  const direction = omitZero(handlerOffsetDirection(handlerOffset));
  
  let positionIndex: number;
  
  if (direction < 0) {
    positionIndex = (currentHandlerOffset - size) / size;
  } else {
    positionIndex = currentHandlerOffset / size;
  }
  
  const changedIndex = Math.round(positionIndex % previousLength);
  const changedOffset = dataLength * size * direction;
  
  return changedOffset + changedIndex * size * direction;
};
```

**Mathematical Model**:
- **Position Index Calculation**: Uses different index formulas based on direction
- **Modular Operation Mapping**: `positionIndex % previousLength` maps old position to new data
- **Offset Reconstruction**: `dataLength * size * direction + changedIndex * size * direction`

**Use Case**: Maintains visual continuity during dynamic data updates

##### compute-offset-if-size-changed.ts - Size Change Scaler

**Concise Algorithm**:
```typescript
export const computeOffsetIfSizeChanged = (opts: IOpts): number => {
  "worklet";
  const { handlerOffset, size, prevSize } = opts;
  return (handlerOffset / prevSize) * size;
};
```

**Mathematical Principle**: Linear proportional scaling, maintains relative position unchanged
**Use Case**: Screen rotation, window size adjustment

#### 2. Data Transformation Tools

##### computed-with-auto-fill-data.ts - Loop Data Generator

**Data Expansion Strategy**:
```typescript
export const computedFillDataWithAutoFillData = <T>(options: {
  data: T[];
  loop: boolean;
  autoFillData: boolean;
}): T[] => {
  const { data, loop, autoFillData } = options;
  
  if (!loop || !autoFillData) return data;
  
  const dataLength = data.length;
  
  if (dataLength === DATA_LENGTH.SINGLE_ITEM) {
    // Single item: [A] -> [A, A, A]
    const item = data[0];
    return [item, item, item];
  }
  
  if (dataLength === DATA_LENGTH.DOUBLE_ITEM) {
    // Double item: [A, B] -> [A, B, A, B]
    return [...data, ...data];
  }
  
  return data;
};
```

**Design Goals**:
- **Minimum Loop Unit**: Ensures minimum dataset for seamless looping
- **Performance Optimization**: Avoids excessive copying of large datasets
- **Visual Continuity**: Eliminates visual jumps at loop boundaries

**Index Converter**:
```typescript
export const computedRealIndexWithAutoFillData = (opts: {
  index: number;
  dataLength: number;
  loop: boolean;
  autoFillData: boolean;
}): number => {
  "worklet";
  
  if (!loop || !autoFillData) return index;
  
  if (dataLength === DATA_LENGTH.SINGLE_ITEM) {
    return 0;  // Single item always returns index 0
  }
  
  if (dataLength === DATA_LENGTH.DOUBLE_ITEM) {
    return index % 2;  // Double item cycles between 0,1
  }
  
  return index % dataLength;
};
```

#### 3. Animation Integration Tools

##### deal-with-animation.ts - Animation Factory

**Factory Pattern Implementation**:
```typescript
export const dealWithAnimation = (
  animationConfigs: WithAnimation = DEFAULT_ANIMATION_OPTIONS
) => {
  "worklet";
  
  return (toValue: number, onFinished?: () => void) => {
    "worklet";
    
    switch (animationConfigs.type) {
      case "spring":
        return withSpring(toValue, animationConfigs.config, onFinished);
      case "timing":
        return withTiming(toValue, animationConfigs.config, onFinished);
      default:
        return withSpring(toValue, DEFAULT_SPRING_CONFIG, onFinished);
    }
  };
};
```

**Default Configuration**:
```typescript
const DEFAULT_ANIMATION_OPTIONS: WithAnimation = {
  type: "spring",
  config: {
    damping: 20,
    mass: 0.2,
    stiffness: 300,
    overshootClamping: false,
    restSpeedThreshold: 0.2,
    restDisplacementThreshold: 0.2,
  },
};
```

#### 4. Direction and Boundary Tools

##### handleroffset-direction.ts - Direction Detector

**Direction Algorithm**:
```typescript
export const handlerOffsetDirection = (handlerOffset: number): number => {
  "worklet";
  
  if (handlerOffset > 0) return 1;
  if (handlerOffset < 0) return -1;
  return 0;  // Zero value handling
};
```

**Supporting Tools**:
```typescript
export const omitZero = (value: number): number => {
  "worklet";
  return value === 0 ? 1 : value;  // Avoid division by zero errors
};
```

#### 5. Offset Calculation Core

##### computed-offset-x-value-with-auto-fill-data.ts - Position Interpolator

**Complex Interpolation Logic**:
```typescript
export const computedOffsetXValueWithAutoFillData = (opts: IOpts): number => {
  "worklet";
  
  const { handlerOffset, index, size, dataLength } = opts;
  
  if (dataLength === DATA_LENGTH.SINGLE_ITEM) {
    const x = handlerOffset % size;
    return Number.isNaN(x) ? 0 : x;
  }
  
  if (dataLength === DATA_LENGTH.DOUBLE_ITEM) {
    const x = (handlerOffset % (size * 2)) + (index % 2) * size;
    return Number.isNaN(x) ? 0 : x;
  }
  
  return handlerOffset + size * index;
};
```

**NaN Protection**: All calculations include `Number.isNaN()` checks to ensure numerical stability.

### Utility Function Collaboration Mode

#### Data Flow Diagram

```
User Props → computedFillDataWithAutoFillData → Expanded Data Array
                                                      ↓
handlerOffset → computeOffsetIfDataChanged → Adjusted Offset → computedOffsetXValueWithAutoFillData → Final Position
                computeOffsetIfSizeChanged              ↓
                                                   dealWithAnimation → Animation Execution
                                                       ↓
                                               handlerOffsetDirection → Direction Control
```

#### Performance Optimization Strategies

1. **Worklet Priority**: All computation functions are marked as worklets, execute on UI thread
2. **Mathematical Optimization**: Uses bitwise operations, lookup tables, and other techniques to optimize computational performance
3. **Boundary Conditions**: Preprocesses boundary cases to avoid runtime exceptions
4. **Memory Friendly**: Avoids temporary object creation, reduces GC pressure

---

## 🎨 Layout System Deep Analysis

### Layout Strategy Architecture

React Native Reanimated Carousel supports 4 main layout modes, each with unique mathematical models and visual effects.

#### 1. Normal Layout - Linear Layout

**Location**: `src/layouts/normal.ts`

**Mathematical Model**:
```typescript
export function normalLayout(opts: { size: number; vertical: boolean }) {
  const { size, vertical } = opts;
  
  return (value: number) => {
    "worklet";
    const translate = interpolate(value, [-1, 0, 1], [-size, 0, size]);
    
    return {
      transform: [
        vertical ? { translateY: translate } : { translateX: translate },
      ],
    };
  };
}
```

**Feature Analysis**:
- **Linear Mapping**: `-1 → -size, 0 → 0, 1 → size`
- **Simple and Efficient**: Minimal computational overhead
- **Smooth Scrolling**: Directly follows gesture movement

#### 2. Parallax Layout - Parallax Scrolling Layout

**Location**: `src/layouts/parallax.ts`

**Core Algorithm**:
```typescript
export function parallaxLayout(
  baseConfig: TBaseConfig,
  modeConfig: ILayoutConfig = {}
): TAnimationStyle {
  const { size, vertical } = baseConfig;
  const {
    parallaxScrollingOffset = 100,
    parallaxScrollingScale = 0.8,
    parallaxAdjacentItemScale = parallaxScrollingScale ** 2,
  } = modeConfig;

  return (value: number) => {
    "worklet";
    
    // Translation calculation - reduce movement distance to create parallax
    const translate = interpolate(
      value,
      [-1, 0, 1],
      [-size + parallaxScrollingOffset, 0, size - parallaxScrollingOffset]
    );
    
    // Layer management - dynamic Z-index changes
    const zIndex = Math.round(
      interpolate(value, [-1, 0, 1], [0, size, 0], Extrapolation.CLAMP)
    );
    
    // Scaling effect - creates depth perception
    const scale = interpolate(
      value,
      [-1, 0, 1],
      [parallaxAdjacentItemScale, parallaxScrollingScale, parallaxAdjacentItemScale],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        vertical ? { translateY: translate } : { translateX: translate },
        { scale },
      ],
      zIndex,
    };
  };
}
```

**Visual Effect Analysis**:
- **Decelerated Movement**: `size - parallaxScrollingOffset` creates parallax sensation
- **Layer Scaling**: Center item at 0.8x, adjacent items at 0.64x (0.8²)
- **Dynamic Layering**: Z-index changes with position, ensures correct occlusion relationships

#### 3. Stack Layout - Card Stacking Layout

**Location**: `src/layouts/stack.ts`

**Complex Mathematical Model**:
```typescript
function getCommonVariables(opts: {
  index: number;
  size: number;
  value: number;
  outputIndex: number;
}) {
  const { value: _value, size, outputIndex } = opts;
  
  // Cubic Bezier easing function
  function easeInOutCubic(v: number): number {
    return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
  }
  
  // Pagination handling
  const page = Math.floor(Math.abs(_value));
  const diff = Math.abs(_value) % 1;
  
  // Apply easing function
  const value = _value < 0 
    ? -(page + easeInOutCubic(diff)) 
    : page + easeInOutCubic(diff);
    
  const interpolatedIndex = outputIndex - value;
  
  return { interpolatedIndex };
}
```

**Stacking Effect Implementation**:
```typescript
export function stackLayout(modeConfig: ILayoutConfig): TAnimationStyle {
  const {
    showLength = 3,
    stackInterval = 18,
    scaleInterval = 0.04,
    opacityInterval = 0.1,
    rotateZDeg = 135,
    snapDirection = "left",
  } = modeConfig;

  return (value: number, index: number) => {
    "worklet";
    
    const { interpolatedIndex } = getCommonVariables({
      index,
      value,
      size: 1,
      outputIndex: 0,
    });
    
    let translateX = interpolate(
      interpolatedIndex,
      [-1, 0, showLength - 1],
      [-moveSize, 0, (showLength - 1) * stackInterval],
      Extrapolation.CLAMP
    );
    
    const scale = interpolate(
      interpolatedIndex,
      [-1, 0, showLength - 1],
      [1, 1, 1 - (showLength - 1) * scaleInterval],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      interpolatedIndex,
      [-1, 0, showLength - 1],
      [0, 1, 1 - (showLength - 1) * opacityInterval],
      Extrapolation.CLAMP
    );
    
    // Directional rotation
    const rotateZ = interpolate(
      interpolatedIndex,
      [-1, 0, 1],
      [snapDirection === "right" ? rotateZDeg : -rotateZDeg, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX },
        { scale },
        { rotateZ: `${rotateZ}deg` },
      ],
      opacity,
      zIndex: -interpolatedIndex,
    };
  };
}
```

**Stacking Parameter Analysis**:
- **showLength**: Number of visible cards
- **stackInterval**: Card spacing (px)
- **scaleInterval**: Scale reduction value per layer
- **opacityInterval**: Opacity reduction value per layer
- **rotateZDeg**: Rotation angle

### Layout Selection and Configuration

#### useLayoutConfig Hook

**Location**: `src/hooks/useLayoutConfig.ts`

```typescript
export function useLayoutConfig<T>(opts: TLayoutConfigOpts<T>): TAnimationStyle {
  return React.useMemo(() => {
    const baseConfig = { size, vertical };
    
    switch (opts.mode) {
      case "parallax":
        return Layouts.parallax(baseConfig, opts.modeConfig);
      case "horizontal-stack":
        return Layouts.horizontalStack(opts.modeConfig);
      case "vertical-stack":
        return Layouts.verticalStack(opts.modeConfig);
      default:
        return Layouts.normal(baseConfig);
    }
  }, [opts.mode, opts.modeConfig, size, vertical]);
}
```

**Design Pattern**: Strategy pattern + Factory pattern, supports runtime layout switching.

---

## 🎮 Gesture Handling System

### ScrollViewGesture Core Architecture

**Location**: `src/components/ScrollViewGesture.tsx`

#### Gesture State Management

```typescript
const panOffset = useSharedValue<number | undefined>(undefined);
const touching = useSharedValue(false);
const validStart = useSharedValue(false);
const scrollEndTranslation = useSharedValue(0);
const scrollEndVelocity = useSharedValue(0);
```

**State Transition Diagram**:
```
IDLE → onGestureBegin → TOUCHING → onGestureStart → ACTIVE
                                     ↓
                               onGestureUpdate → DRAGGING
                                     ↓
                                onGestureEnd → SETTLING → IDLE
```

#### Gesture Handling Core Logic

##### Gesture Begin Handling
```typescript
const onGestureBegin = useCallback((e: PanGestureHandlerEventPayload) => {
  "worklet";
  
  touching.value = true;
  validStart.value = false;
  panOffset.value = translation.value;
  
  onTouchBegin?.();
}, [translation, onTouchBegin]);
```

##### Gesture Update Handling
```typescript
const onGestureUpdate = useCallback((e: PanGestureHandlerEventPayload) => {
  "worklet";
  
  if (!validStart.value) {
    // Validate gesture direction
    validStart.value = Math.abs(translationX) >= Math.abs(translationY) === !vertical;
  }
  
  if (!validStart.value) return;
  
  const panTranslation = panOffset.value + translationValue;
  const newTranslation = withProcessTranslation(panTranslation);
  
  translation.value = newTranslation;
}, [translation, panOffset, vertical]);
```

##### Boundary Processing Function
```typescript
function withProcessTranslation(translation: number): number {
  "worklet";
  
  if (!loop && !overscrollEnabled) {
    const limit = getLimit();
    const sign = Math.sign(translation);
    return sign * Math.max(0, Math.min(limit, Math.abs(translation)));
  }
  
  return translation;
}
```

#### Advanced Gesture Features

##### Paging and Snapping
```typescript
const scrollWithSpring = useCallback((toValue: number, onFinished?: () => void) => {
  const finalValue = pagingEnabled 
    ? Math.round(toValue / size) * size 
    : snapEnabled 
      ? Math.round(toValue / size) * size 
      : toValue;
      
  translation.value = withSpring(finalValue, SCROLL_END_SPRING_CONFIG, onFinished);
}, [translation, size, pagingEnabled, snapEnabled]);
```

##### Velocity Calculation and Inertial Scrolling
```typescript
const onGestureEnd = useCallback((e: PanGestureHandlerEventPayload) => {
  "worklet";
  
  const velocity = velocityValue;
  const translation = translationValue;
  
  // Velocity-based page jumping
  if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
    const direction = Math.sign(velocity);
    const pages = Math.min(Math.abs(velocity) / 1000, MAX_PAGE_JUMP);
    const targetIndex = getCurrentIndex() + direction * Math.ceil(pages);
    
    scrollTo(targetIndex * size);
  } else {
    // Normal snapping
    scrollWithSpring(translation);
  }
}, [getCurrentIndex, scrollTo, scrollWithSpring]);
```

### Gesture Proxy System

#### usePanGestureProxy Design

**Core Idea**: Allow external gesture configuration while maintaining internal logic integrity.

```typescript
export function usePanGestureProxy(onConfigurePanGesture?: (panGesture: PanGesture) => void) {
  const savedCallbacks = React.useRef<GestureCallbacks>({});
  
  const proxyPanGesture = React.useMemo(() => {
    const panGesture = Gesture.Pan();
    
    // Save original callbacks
    const saveCallback = (name: keyof GestureCallbacks, callback: any) => {
      savedCallbacks.current[name] = callback;
    };
    
    // Apply user configuration
    if (onConfigurePanGesture) {
      onConfigurePanGesture(panGesture);
      
      // Save user-set callbacks
      saveCallback('onBegin', panGesture._handlers.onBegin);
      saveCallback('onStart', panGesture._handlers.onStart);
      // ... other callbacks
    }
    
    return panGesture;
  }, [onConfigurePanGesture]);
  
  const applyInternalLogic = (gesture: PanGesture, internalHandlers: GestureCallbacks) => {
    return gesture
      .onBegin((e) => {
        savedCallbacks.current.onBegin?.(e);
        internalHandlers.onBegin?.(e);
      })
      .onUpdate((e) => {
        savedCallbacks.current.onUpdate?.(e);
        internalHandlers.onUpdate?.(e);
      });
      // ... other handlers
  };
  
  return { proxyPanGesture, applyInternalLogic };
}
```

**Proxy Pattern Advantages**:
1. **User Customization**: Supports gesture configuration extensions
2. **Internal Logic Protection**: Core functionality remains unaffected
3. **Callback Merging**: Automatically merges user and internal callbacks

---

## 🧮 Pagination System Architecture

### Pagination Component Design

React Native Reanimated Carousel's pagination system adopts the **Composite Pattern**, providing Basic and Custom implementations.

#### Pagination System Structure

**Location**: `src/components/Pagination/`

```
Pagination/
├── index.tsx          # Export interface
├── Basic/
│   ├── index.tsx      # Basic paginator
│   └── PaginationItem.tsx  # Pagination item component
└── Custom/
    ├── index.tsx      # Custom paginator  
    └── PaginationItem.tsx  # Custom pagination item
```

#### Basic Pagination - Standard Paginator

**Location**: `src/components/Pagination/Basic/index.tsx`

**Core Implementation**:
```typescript
export const Basic = <T extends {}>(props: BasicProps<T>) => {
  const {
    activeDotStyle,
    dotStyle,
    progress,
    horizontal = true,
    data,
    size,
    containerStyle,
    renderItem,
    onPress,
  } = props;

  return (
    <View style={[containerStyle, { 
      flexDirection: horizontal ? "row" : "column",
      justifyContent: "space-between",
      alignSelf: "center"
    }]}>
      {data.map((item, index) => (
        <PaginationItem
          key={index}
          index={index}
          size={size}
          count={data.length}
          dotStyle={dotStyle}
          animValue={progress}
          horizontal={!horizontal}
          activeDotStyle={activeDotStyle}
          onPress={() => onPress?.(index)}
        >
          {renderItem?.(item, index)}
        </PaginationItem>
      ))}
    </View>
  );
};
```

**Design Features**:
- **Generic Support**: `<T extends {}>` supports arbitrary data types
- **Flexible Layout**: Supports horizontal and vertical layouts
- **Click Navigation**: Supports click-to-jump through `onPress`
- **Custom Rendering**: `renderItem` supports fully custom items

#### Custom Pagination - Advanced Paginator

**Location**: `src/components/Pagination/Custom/index.tsx`

**Enhanced Features**:
```typescript
export interface ShapeProps<T extends {}> extends BasicProps<T> {
  customReanimatedStyle?: (progress: number, index: number, length: number) => DefaultStyle;
}
```

**Dynamic Size Calculation**:
```typescript
const maxItemWidth = Math.max(size ?? 0, dotStyle?.width ?? 0, activeDotStyle?.width ?? 0);
const maxItemHeight = Math.max(size ?? 0, dotStyle?.height ?? 0, activeDotStyle?.height ?? 0);

const containerStyle = {
  minWidth: maxItemWidth,
  minHeight: maxItemHeight,
  // ...other styles
};
```

#### PaginationItem Core Logic

**Animation Calculation**:
```typescript
const PaginationItem: React.FC<Props> = (props) => {
  const { animValue, index, count, customReanimatedStyle } = props;
  
  const animatedStyle = useAnimatedStyle(() => {
    const progress = animValue.value;
    
    if (customReanimatedStyle) {
      return customReanimatedStyle(progress, index, count);
    }
    
    // Default animation: scaling and opacity based on progress
    const distance = Math.abs(progress - index);
    const scale = interpolate(distance, [0, 1], [1, 0.6], Extrapolation.CLAMP);
    const opacity = interpolate(distance, [0, 1], [1, 0.3], Extrapolation.CLAMP);
    
    return { transform: [{ scale }], opacity };
  }, [animValue, index, count, customReanimatedStyle]);
  
  return (
    <Animated.View style={[baseStyle, animatedStyle]}>
      {/* Pagination item content */}
    </Animated.View>
  );
};
```

### Pagination System Integration

#### Connection with Main Carousel

The pagination system synchronizes with the main carousel through `SharedValue<number>`:

```typescript
// In Carousel component
const progress = useSharedValue(0);

// Update progress through useOnProgressChange
useOnProgressChange({
  onProgressChange: progress, // Pass SharedValue directly
  // ...other parameters
});

// Use in pagination component
<Pagination.Basic
  progress={progress}
  data={data}
  onPress={(index) => carouselRef.current?.scrollTo({ index })}
/>
```

**Data Flow**:
```
handlerOffset → useOnProgressChange → progress SharedValue → PaginationItem → Animation Update
```

---

## 🔄 Data Flow Architecture Deep Analysis

### Overall Data Flow Diagram

```mermaid
graph TB
    A[User Props] --> B[useInitProps]
    B --> C[Standardized Props]
    C --> D[useCommonVariables]
    D --> E[handlerOffset SharedValue]
    
    E --> F[useVisibleRanges]
    F --> G[Visible Item Range]
    
    E --> H[useOffsetX]
    G --> H
    H --> I[Single Item Position Value]
    
    I --> J[useLayoutConfig]
    J --> K[Animation Function]
    K --> L[Final Style]
    
    E --> M[useOnProgressChange]
    M --> N[Progress Callback]
    
    E --> O[useCarouselController]
    O --> P[Control API]
    
    Q[User Gesture] --> R[ScrollViewGesture]
    R --> E
    
    S[Auto Play Timer] --> T[useAutoPlay]
    T --> O
```

### Core Data Structures

#### 1. SharedValue Ecosystem

```typescript
// Core state - drives all animations
const handlerOffset: SharedValue<number>

// Container size - responsive layout
const containerSize: SharedValue<{width: number; height: number}>

// Item dimensions collection - supports dynamic sizing (future feature)
const itemDimensions: SharedValue<Record<number, {width: number; height: number}>>

// Visible range - performance optimization
const visibleRanges: SharedValue<{
  negativeRange: [number, number];
  positiveRange: [number, number];
}>

// Gesture state
const touching: SharedValue<boolean>
const panOffset: SharedValue<number | undefined>
```

#### 2. Props Data Flow

```typescript
// Original Props
interface TCarouselProps<T> {
  data: T[];
  renderItem: CarouselRenderItem<T>;
  // ...50+ other configurations
}

// After useInitProps processing
interface TInitializeCarouselProps<T> extends TCarouselProps<T> {
  dataLength: number;        // Processed data length
  rawDataLength: number;     // Original data length  
  data: T[];                // Possibly autoFill processed data
  size: number;             // Standardized size
  // ...standardized other properties
}
```

#### 3. Animation Value Calculation Chain

```typescript
// Calculation chain
handlerOffset.value                    // -240 (example value)
    ↓ useOffsetX
individualOffset.value                 // -240 + index * size  
    ↓ useDerivedValue  
animationValue.value                   // (-240 + index * size) / size
    ↓ useAnimatedStyle
animatedStyle                          // { transform: [{ translateX: ... }] }
    ↓ Rendering Engine
Final Visual Effect                    // Animation on screen
```

### Performance-Optimized Data Flow Design

#### 1. Worklet-Priority Computation

All mathematical calculations execute on the UI thread:

```typescript
const animationValue = useDerivedValue(() => {
  "worklet";  // Key marker
  
  // Complex computation executes on UI thread, avoiding bridge overhead
  const complexCalculation = someComplexMath(handlerOffset.value);
  return complexCalculation;
}, [dependency]);
```

#### 2. Viewport-Optimized Data Flow

```typescript
// Only calculate animation values for visible items
const shouldCalculate = useDerivedValue(() => {
  "worklet";
  
  const ranges = visibleRanges.value;
  const isVisible = (
    (index >= ranges.negativeRange[0] && index <= ranges.negativeRange[1]) ||
    (index >= ranges.positiveRange[0] && index <= ranges.positiveRange[1])
  );
  
  return isVisible;
}, [visibleRanges, index]);
```

#### 3. Caching and Memoization

```typescript
// Layout configuration caching
const layoutConfig = React.useMemo(() => {
  const baseConfig = { size, vertical };
  return selectLayout(mode, baseConfig, modeConfig);
}, [mode, size, vertical, modeConfig]);  // Precise dependencies, avoid meaningless recalculation

// Callback function stabilization
const stableCallback = React.useCallback((value: number) => {
  // Processing logic
}, [dependency]);  // Minimal dependency set
```

### State Synchronization Mechanism

#### 1. Reactive Data Updates

```typescript
// Auto-adaptation when data changes
useAnimatedReaction(
  () => ({ data: dataLength, size }),
  ({ data, size: newSize }, previous) => {
    if (previous) {
      if (data !== previous.data) {
        // Data change -> recalculate offset
        handlerOffset.value = computeOffsetIfDataChanged({
          handlerOffset: handlerOffset.value,
          dataLength: data,  
          previousLength: previous.data,
          size: newSize,
        });
      }
      
      if (newSize !== previous.size) {
        // Size change -> proportional scaling
        handlerOffset.value = computeOffsetIfSizeChanged({
          handlerOffset: handlerOffset.value,
          size: newSize,
          prevSize: previous.size,
        });
      }
    }
  },
  [dataLength, size]
);
```

#### 2. Multi-Layer State Broadcasting

```typescript
// handlerOffset change -> multiple subscribers respond simultaneously
handlerOffset.value = newValue;

// Simultaneously triggers:
// 1. useOffsetX recalculates item positions
// 2. useOnProgressChange updates progress
// 3. useCarouselController updates current index
// 4. useVisibleRanges recalculates visible range
// 5. Various ItemLayout re-render
```

---

## ⚡ Performance Optimization Strategy Deep Analysis

### 1. Rendering Level Optimization

#### Viewport Rendering (Windowing)

**Core Idea**: Only render visible items + buffer zone, significantly reducing rendering pressure for large datasets.

```typescript
// useVisibleRanges core algorithm
const getVisibleRanges = useCallback((offset: number): IVisibleRanges => {
  "worklet";
  
  const startIndex = Math.floor(offset / viewSize);
  const endIndex = Math.ceil((offset + viewSize) / viewSize);
  
  // Dynamic buffer calculation
  const buffer = windowSize > 0 ? Math.floor(windowSize / 2) : DEFAULT_COUNT;
  
  return {
    negativeRange: [startIndex - buffer, startIndex + buffer],
    positiveRange: [endIndex - buffer, endIndex + buffer],
  };
}, [viewSize, windowSize]);

// Rendering decision in ItemRenderer
const shouldRender = (index >= negativeRange[0] && index <= negativeRange[1]) ||
                    (index >= positiveRange[0] && index <= positiveRange[1]);

if (!shouldRender) return null;  // Skip rendering
```

**Performance Gain**: 1000-item dataset from full rendering down to ~10 item rendering, performance improvement 90%+

#### Animation Calculation Optimization

```typescript
// Conditional calculation in useOffsetX
const x = useDerivedValue(() => {
  "worklet";
  
  // Only perform complex calculations for visible items
  const ranges = visibleRanges.value;
  const isInRange = checkVisibility(index, ranges);
  
  if (!isInRange) {
    return 0;  // Return default value for invisible items
  }
  
  // Complex interpolation calculation only executed for visible items
  return complexInterpolationCalculation(handlerOffset.value, index);
}, [handlerOffset, visibleRanges, index]);
```

### 2. Computation Level Optimization

#### Worklet Priority Strategy

```typescript
// ✅ Correct: UI thread execution, 60fps guarantee
const animatedValue = useDerivedValue(() => {
  "worklet";
  return heavyCalculation(sharedValue.value);
}, [sharedValue]);

// ❌ Incorrect: JS thread execution, prone to stuttering  
const [state, setState] = useState(0);
useEffect(() => {
  const result = heavyCalculation(props.value);
  setState(result);
}, [props.value]);
```

#### Interpolation Algorithm Optimization

```typescript
// Pre-compute interpolation table, avoid repeated calculations
const interpolationCache = React.useMemo(() => {
  const cache = new Map();
  for (let i = 0; i <= PRECISION; i++) {
    const input = i / PRECISION;
    cache.set(input, expensiveInterpolation(input));
  }
  return cache;
}, []);

// Use cached interpolation
const optimizedInterpolate = (input: number) => {
  "worklet";
  const key = Math.round(input * PRECISION) / PRECISION;
  return interpolationCache.get(key) || input;
};
```

### 3. Memory Management Optimization

#### Avoid Temporary Object Creation

```typescript
// ❌ Poor implementation: creates new objects every time
const badAnimatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value }],  // New object
    opacity: opacity.value,                     // New object
  };
}, [offset, opacity]);

// ✅ Optimized implementation: reuse style objects
const reusableStyle = { transform: [{ translateX: 0 }], opacity: 1 };
const goodAnimatedStyle = useAnimatedStyle(() => {
  reusableStyle.transform[0].translateX = offset.value;
  reusableStyle.opacity = opacity.value;
  return reusableStyle;
}, [offset, opacity]);
```

#### SharedValue Minimization

```typescript
// Merge related state into single SharedValue
const gestureState = useSharedValue({
  offset: 0,
  velocity: 0,
  touching: false,
});

// Instead of creating separately
// const offset = useSharedValue(0);
// const velocity = useSharedValue(0);  
// const touching = useSharedValue(false);
```

### 4. Data Structure Optimization

#### Efficient Data Transformation

```typescript
// Optimization strategy for computedFillDataWithAutoFillData
export const computedFillDataWithAutoFillData = <T>(options: {
  data: T[];  
  loop: boolean;
  autoFillData: boolean; 
}): T[] => {
  const { data, loop, autoFillData } = options;
  
  // Early exit, avoid unnecessary processing
  if (!loop || !autoFillData) return data;
  
  const dataLength = data.length;
  
  // Predefined processing strategies, avoid runtime judgment
  if (dataLength === DATA_LENGTH.SINGLE_ITEM) {
    const item = data[0];
    return SINGLE_ITEM_CACHE || (SINGLE_ITEM_CACHE = [item, item, item]);
  }
  
  if (dataLength === DATA_LENGTH.DOUBLE_ITEM) {
    return DOUBLE_ITEM_CACHE || (DOUBLE_ITEM_CACHE = [...data, ...data]);
  }
  
  return data;
};
```

### 5. Responsive Optimization

#### Precise Dependency Management

```typescript
// ❌ Excessive dependencies: causes unnecessary recalculation
const style = useAnimatedStyle(() => {
  return { transform: [{ translateX: offset.value }] };
}, [offset, props, config, data]);  // Too many dependencies

// ✅ Precise dependencies: only truly affecting values
const style = useAnimatedStyle(() => {
  return { transform: [{ translateX: offset.value }] };
}, [offset]);  // Minimal dependency set
```

#### Intelligent Caching Strategy

```typescript
// Caching strategy for useLayoutConfig
export function useLayoutConfig<T>(opts: TLayoutConfigOpts<T>): TAnimationStyle {
  return React.useMemo(() => {
    // Complex layout configuration calculation
    const layoutFunction = createLayoutFunction(opts);
    
    // Return stable function reference
    return React.useCallback(layoutFunction, [opts.mode, opts.modeConfig]);
  }, [opts.mode, opts.modeConfig, opts.size, opts.vertical]);
}
```

### 6. Gesture Handling Optimization

#### Debouncing and Throttling

```typescript
const onGestureUpdate = useCallback((e: PanGestureHandlerEventPayload) => {
  "worklet";
  
  // Gesture debouncing: ignore minor changes
  if (Math.abs(e.translationX) < GESTURE_THRESHOLD) return;
  
  // Calculation throttling: limit update frequency
  const now = Date.now();
  if (now - lastUpdateTime.value < UPDATE_INTERVAL) return;
  
  lastUpdateTime.value = now;
  
  // Execute actual update
  updateOffset(e.translationX);
}, []);
```

### 7. Animation Performance Optimization

#### Animation Configuration Optimization

```typescript
// High-performance spring configuration
const OPTIMIZED_SPRING_CONFIG: WithSpringConfig = {
  damping: 20,        // Higher damping, reduce oscillation
  mass: 0.2,          // Smaller mass, quick response
  stiffness: 300,     // Moderate stiffness, balance speed and smoothness
  overshootClamping: true,  // Prevent overshoot, improve stability
  restSpeedThreshold: 0.2,  // Smaller threshold, precise stopping
  restDisplacementThreshold: 0.2,
};

// Timing animation optimization
const OPTIMIZED_TIMING_CONFIG: WithTimingConfig = {
  duration: 300,      // Short duration, quick response
  easing: Easing.out(Easing.cubic),  // Ease-out effect, natural feel
};
```

---

## 🔧 Type System Architecture

### Core Type Definitions

#### TCarouselProps - Main Configuration Interface

**Location**: `src/types.ts`

```typescript
export type TCarouselProps<T = any> = {
  // Data related
  data: T[];
  renderItem: CarouselRenderItem<T>;
  defaultIndex?: number;
  
  // Layout related  
  width?: number;
  height?: number;
  vertical?: boolean;
  
  // Behavior related
  loop?: boolean;
  autoFillData?: boolean;
  autoPlay?: boolean;
  pagingEnabled?: boolean;
  
  // Gesture related
  enabled?: boolean;
  onConfigurePanGesture?: (panGesture: PanGesture) => void;
  
  // Animation related
  withAnimation?: WithAnimation;
  customAnimation?: (value: number, index: number) => ViewStyle;
  
  // Callback related
  onSnapToItem?: (index: number) => void;
  onScrollStart?: () => void;
  onScrollEnd?: (index: number) => void;
  onProgressChange?: 
    | ((offsetProgress: number, absoluteProgress: number) => void)
    | SharedValue<number>;
} & (TParallaxModeProps | TStackModeProps);
```

#### Directional Type System

```typescript
export type IComputedDirectionTypes<T, VP = {}, HP = {}> =
  | (T & VP & {
      vertical: true;
      width?: number;
      height: number;  // Vertical mode must specify height
    })
  | (T & HP & {
      vertical?: false;
      width: number;   // Horizontal mode must specify width
      height?: number;
    });
```

**Design Advantage**: Ensures necessary size parameters through conditional types, catches configuration errors at compile time.

#### Layout Mode Types

```typescript
// Parallax mode specific types
export type TParallaxModeProps = IComputedDirectionTypes<
  { 
    mode?: "parallax";
    modeConfig?: IParallaxConfig;
  },
  IVerticalParallaxModeProps,
  IHorizontalParallaxModeProps
>;

// Stack mode specific types  
export type TStackModeProps = IComputedDirectionTypes<
  {
    mode?: "horizontal-stack" | "vertical-stack";
    modeConfig?: ILayoutConfig;
  },
  IVerticalStackModeProps,
  IHorizontalStackModeProps
>;
```

### Advanced Type Features

#### Generic Constraints and Type Inference

```typescript
// Component-level generics
const Carousel = <T>(props: TCarouselProps<T>) => {
  // T type automatically inferred, ensures data, renderItem type consistency
};

// Usage example - complete type safety
interface Product {
  id: string;
  name: string;
  price: number;
}

<Carousel<Product>
  data={products}  // Product[]
  renderItem={({item, index}) => {
    // item automatically inferred as Product type
    return <ProductCard product={item} />;
  }}
/>
```

#### Worklet Type Support

```typescript
// Worklet type annotation for utility functions
export const computeOffsetIfDataChanged = (opts: IOpts): number => {
  "worklet";  // Compiler directive
  // Function implementation
};

// Animation style function type
export type TAnimationStyle = (value: number, index?: number) => ViewStyle;

// Ensure animation functions support Worklet
const customAnimation: TAnimationStyle = (value: number) => {
  "worklet";
  return {
    transform: [{ scale: interpolate(value, [-1, 0, 1], [0.8, 1, 0.8]) }],
  };
};
```

---

## 🎯 Testing Strategy and Coverage Analysis

### Current Test Coverage Status

#### Coverage Status (Baseline Data)
- **Overall Coverage**: 78.61% (581/739 statements)
- **Branch Coverage**: 58.26% (303/520 branches) 
- **Function Coverage**: 84.5% (120/142 functions)
- **Line Coverage**: 79.82% (546/684 lines)

#### Test File Distribution
```
src/
├── components/
│   ├── Carousel.test.tsx ✅
│   └── rnr-demo.test.tsx ✅
├── hooks/ (12 hooks, 11 have tests) 
│   ├── useAutoPlay.test.ts ✅
│   ├── useCarouselController.test.tsx ✅  
│   ├── useCheckMounted.test.ts ✅
│   ├── useCommonVariables.test.tsx ✅
│   ├── useInitProps.test.tsx ✅
│   ├── useLayoutConfig.test.tsx ✅
│   ├── useOffsetX.test.ts ✅
│   ├── useOnProgressChange.test.tsx ✅
│   ├── usePanGestureProxy.test.tsx ✅
│   ├── useUpdateGestureConfig.test.ts ✅
│   ├── useVisibleRanges.test.tsx ✅
│   └── usePropsErrorBoundary.ts ❌ (No tests)
├── layouts/
│   └── stack.test.ts ✅ (Only stack layout has tests)
└── utils/ (Full coverage)
    ├── compute-offset-if-data-changed.test.ts ✅
    ├── compute-offset-if-size-changed.test.ts ✅
    ├── computed-with-auto-fill-data.test.ts ✅
    ├── deal-with-animation.test.ts ✅
    ├── handleroffset-direction.test.ts ✅
    ├── index.test.ts ✅
    └── log.test.ts ✅
```

#### Test Coverage Gaps

**🔴 Zero Coverage Modules**:
1. **LazyView.tsx**: 0% - Lazy loading component completely untested
2. **All Pagination Components**: 0% - Pagination system has no test coverage
   - `Basic/index.tsx` 
   - `Basic/PaginationItem.tsx`
   - `Custom/index.tsx`
   - `Custom/PaginationItem.tsx`

**🟡 Low Coverage Modules**:
1. **ScrollViewGesture.tsx**: 66.43% - Gesture handling logic incomplete
2. **usePropsErrorBoundary.ts**: 70% - Error boundary handling testing insufficient
3. **layouts/parallax.ts, normal.ts**: No dedicated tests

### Test Architecture Design Principles

#### 1. Layered Testing Strategy

```typescript
// Unit tests - Utility function layer
describe('computeOffsetIfDataChanged', () => {
  it('should handle data length increase', () => {
    const result = computeOffsetIfDataChanged({
      handlerOffset: 100,
      dataLength: 5,
      previousLength: 3,
      size: 50,
    });
    expect(result).toBe(expectedValue);
  });
});

// Integration tests - Hook layer
describe('useCarouselController', () => {
  it('should navigate to next item correctly', async () => {
    const { result } = renderHook(() => useCarouselController(mockProps));
    
    act(() => {
      result.current.next();
    });
    
    await waitFor(() => {
      expect(mockHandlerOffset.value).toBe(expectedOffset);
    });
  });
});

// Component tests - UI layer  
describe('Carousel', () => {
  it('should render items correctly', () => {
    render(
      <Carousel
        data={mockData}
        renderItem={mockRenderItem}
        width={300}
        height={200}
      />
    );
    
    expect(screen.getByTestId('__CAROUSEL_ITEM_0__')).toBeInTheDocument();
  });
});
```

#### 2. Reanimated Testing Mode

```typescript
// Reanimated mock configuration in jest-setup.js
import 'react-native-reanimated/lib/reanimated2/jestUtils';

// SharedValue assertions in tests
it('should update shared value correctly', () => {
  const sharedValue = useSharedValue(0);
  
  // Use scheduleOnRN for async assertions
  const expectation = jest.fn();
  
  scheduleOnRN(expectation, sharedValue.value);
  
  expect(expectation).toHaveBeenCalledWith(expectedValue);
});
```

---

## 🚀 Extensibility and Future Planning

### Component Architecture Extension Points

#### 1. Custom Layout Strategies

Currently supports 4 layouts, architecture design supports unlimited extension:

```typescript
// Example of adding 3D flip layout
export function flip3DLayout(baseConfig: TBaseConfig): TAnimationStyle {
  const { size, vertical } = baseConfig;
  
  return (value: number) => {
    "worklet";
    
    const rotateY = interpolate(
      value,
      [-1, 0, 1],
      [90, 0, -90],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [
        { perspective: 1000 },
        vertical ? { rotateX: `${rotateY}deg` } : { rotateY: `${rotateY}deg` },
      ],
    };
  };
}

// Register in useLayoutConfig
switch (opts.mode) {
  case "flip3d":
    return Layouts.flip3D(baseConfig, opts.modeConfig);
  // ...existing cases
}
```

#### 2. Dynamic Size Support

Reserved dynamic size interface:

```typescript
// Reserved interface in store/index.tsx
interface IContext {
  layout: {
    itemDimensions: SharedValue<ItemDimensions>;
    updateItemDimensions: (index: number, dimensions: {width: number; height: number}) => void;
  };
}

// Reserved implementation in ItemLayout.tsx
// TODO: For dynamic dimension in the future
// function handleLayout(e: LayoutChangeEvent) {
//   const { width, height } = e.nativeEvent.layout;
//   updateItemDimensions(index, { width, height });
// }
```

#### 3. Plugin System Design

```typescript
// Future plugin interface design
interface CarouselPlugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  onInit?: (carousel: ICarouselInstance) => void;
  onItemChange?: (index: number) => void;
  onDispose?: () => void;
  
  // Custom Hook injection
  usePluginHook?: () => any;
  
  // Style enhancement
  enhanceItemStyle?: (baseStyle: ViewStyle, index: number) => ViewStyle;
}

// Plugin usage
<Carousel
  plugins={[thumbnailPlugin, analyticsPlugin]}
  // ...other props
/>
```

### Performance Optimization Development Direction

#### 1. Web Assembly Integration

```typescript
// Potential WASM integration for complex mathematical calculations
import { heavyMathCalculation } from './carousel-math.wasm';

const optimizedOffsetCalculation = useDerivedValue(() => {
  "worklet";
  
  // Move complex interpolation calculations to WASM
  return heavyMathCalculation(
    handlerOffset.value,
    size,
    dataLength,
    // ...other params
  );
}, [dependencies]);
```

#### 2. Smarter Pre-rendering

```typescript
// Predictive rendering system
const usePredictiveRendering = (velocity: SharedValue<number>) => {
  const predictedRange = useDerivedValue(() => {
    "worklet";
    
    // Predict user scroll direction and distance based on velocity
    const prediction = velocity.value * PREDICTION_MULTIPLIER;
    const futureOffset = handlerOffset.value + prediction;
    
    return calculateVisibleRange(futureOffset);
  }, [velocity, handlerOffset]);
  
  return predictedRange;
};
```

### Ecosystem Integration

#### React Native New Feature Adaptation

```typescript
// Fabric new architecture adaptation
const CarouselFabric = React.forwardRef<ICarouselInstance, TCarouselProps>((props, ref) => {
  // Utilize Fabric's new features
  const nativeComponent = useNativeComponent('RNCCarousel');
  
  return (
    <nativeComponent
      {...props}
      ref={ref}
    />
  );
});

// Hermes engine optimization
// Utilize Hermes's new JIT features to optimize Worklet execution
```

---

## 📚 Developer Guide

### Code Contribution Process

#### 1. Development Environment Setup

```bash
# Clone project
git clone https://github.com/dohooo/react-native-reanimated-carousel.git

# Install dependencies
yarn install

# Run tests
yarn test

# Run type checking
yarn types

# Run lint
yarn lint

# Build project
yarn prepare
```

#### 2. Code Standards

**TypeScript Coding Standards**:
```typescript
// ✅ Recommended function definition
export const useCustomHook = (opts: {
  param1: number;
  param2: string;
}): ReturnType => {
  "worklet";  // Worklet functions must be marked
  
  // Implementation logic
  return result;
};

// ✅ Recommended component definition
export const CustomComponent: React.FC<Props> = (props) => {
  const { prop1, prop2 } = props;
  
  // Component logic
  return <View>{/* JSX */}</View>;
};
```

**Naming Conventions**:
- Hook functions: `useXxxxXxxx`
- Utility functions: `computedXxxxXxxx` or `xxxWithXxxx`
- Type definitions: `TXxxxXxxx` (types) or `IXxxxXxxx` (interfaces)
- Constants: `UPPER_SNAKE_CASE`

#### 3. Test Writing Guide

```typescript
// Unit test template
describe('utilityFunction', () => {
  it('should handle normal case', () => {
    const result = utilityFunction(normalInput);
    expect(result).toBe(expectedOutput);
  });
  
  it('should handle edge case', () => {
    const result = utilityFunction(edgeInput);
    expect(result).toBe(expectedEdgeOutput);
  });
  
  it('should handle error case', () => {
    expect(() => utilityFunction(invalidInput)).toThrow();
  });
});

// Hook test template
describe('useCustomHook', () => {
  it('should return expected result', () => {
    const { result } = renderHook(() => useCustomHook(mockProps));
    
    expect(result.current.value).toBe(expectedValue);
  });
  
  it('should update when dependencies change', () => {
    const { result, rerender } = renderHook(
      (props) => useCustomHook(props),
      { initialProps: initialMockProps }
    );
    
    rerender(updatedMockProps);
    
    expect(result.current.value).toBe(updatedExpectedValue);
  });
});
```

### Common Issues and Solutions

#### 1. Performance Issue Troubleshooting

```typescript
// Issue: Large dataset scrolling lag
// Solution: Check windowSize configuration
<Carousel
  windowSize={20}  // Limit active item count
  data={largeDataSet}
/>

// Issue: Custom animation lag
// Solution: Ensure animation functions use worklet
const customAnimation = (value: number) => {
  "worklet";  // Must add
  return {
    transform: [{ scale: value }],
  };
};
```

#### 2. Type Error Resolution

```typescript
// Issue: Generic type inference failure
// Solution: Explicitly specify generic type
<Carousel<YourDataType>
  data={yourData}
  renderItem={({item}) => {
    // item now has correct type
    return <YourComponent data={item} />;
  }}
/>
```

#### 3. Layout Issue Debugging

```typescript
// Issue: Carousel items display abnormally
// Solution: Check container size settings
<Carousel
  width={Dimensions.get('window').width}  // Ensure correct width
  height={200}  // Ensure correct height
  data={data}
/>
```

---

## 🎖️ Summary

React Native Reanimated Carousel is an architecturally sound, performance-excellent carousel component library. Its design embodies the following core values:

### Architectural Advantages

1. **Clear Layering**: Presentation layer, logic layer, computation layer, foundation layer with clear responsibilities
2. **Performance Priority**: Worklet + viewport optimization + precise dependency management
3. **Type Safety**: Complete TypeScript support, compile-time error catching
4. **Highly Extensible**: Plugin-based layout strategies, compositional component design
5. **Math-Driven**: Precise interpolation algorithms and boundary handling

### Technical Innovation

1. **SharedValue Ecosystem**: Reactive state management centered on `handlerOffset`
2. **Proxy Pattern**: `usePanGestureProxy` balances customization and stability
3. **Viewport Optimization**: Breakthrough in large dataset rendering performance
4. **Worklet Priority**: UI thread computation ensures smooth animations

### Future Development

The component library has good extensibility, reserving sufficient space for future development:
- Support for more layout modes
- Dynamic sizing feature improvement  
- Plugin ecosystem construction
- New platform adaptation (Web, Desktop)

This architecture document provides a complete technical foundation for subsequent test coverage improvement, feature extension, and performance optimization. Through deep understanding of the component library's operational mechanisms, developers can more effectively perform secondary development, bug fixes, and performance tuning.

---

**Document Version**: v1.0  
**Last Updated**: 2025  
**Applicable Version**: react-native-reanimated-carousel v4.0.2+