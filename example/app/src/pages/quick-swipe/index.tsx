import * as React from "react";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

import { SBItem } from "../../components/SBItem";
import { window } from "../../constants";
import { Button, Image, ImageSourcePropType, ViewStyle, useWindowDimensions } from "react-native";
import Animated, { Easing, Extrapolate, FadeIn, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDecay, withSpring, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from 'expo-haptics';
import { getImages } from "./images";

const PAGE_WIDTH = window.width;
const data = getImages().slice(0, 68);

function Index() {
  const windowWidth = useWindowDimensions().width;
  const scrollOffsetValue = useSharedValue<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = {
    vertical: false,
    width: windowWidth,
    height: PAGE_WIDTH / 2,
  } as const

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{
        flex: 1,
        backgroundColor: 'black',
        justifyContent: "center",
      }}
    >
      <Carousel
        {...baseOptions}
        loop={false}
        enabled // Default is true, just for demo
        ref={ref}
        defaultScrollOffsetValue={scrollOffsetValue}
        testID={"xxx"}
        style={{ width: "100%" }}
        autoPlay={false}
        autoPlayInterval={1000}
        data={data}
        onConfigurePanGesture={g => g.enabled(false)}
        pagingEnabled
        onSnapToItem={index => console.log("current index:", index)}
        windowSize={2}
        renderItem={({ index, item }) => {
          return <Animated.View
            key={index}
            style={{ flex: 1 }}
          >
            <SBItem
              showIndex={false}
              img={item}
            />
          </Animated.View>
        }}
      />
      <ThumbnailPagination
        style={{ marginVertical: 9 }}
        onIndexChange={(index) => {
          ref.current?.scrollTo({ index, animated: false })
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
      />
    </SafeAreaView>
  );
}

const ThumbnailPagination: React.FC<{
  style?: ViewStyle
  onIndexChange?: (index: number) => void
}> = ({ style, onIndexChange }) => {
  const [_containerWidth, setContainerWidth] = React.useState<number>(0);
  const inactiveWidth = 30;
  const activeWidth = inactiveWidth * 2;
  const itemGap = 5;
  const totalWidth = inactiveWidth * (data.length - 1) + activeWidth + itemGap * (data.length - 1);
  const swipeProgress = useSharedValue<number>(0);
  const activeIndex = useSharedValue<number>(0);

  const containerWidth = React.useMemo(() => {
    if (totalWidth < _containerWidth) {
      return totalWidth
    }

    return _containerWidth
  }, [
    _containerWidth,
    totalWidth,
  ])

  const gesture = React.useMemo(() => Gesture
    .Pan()
    .onUpdate((event) => {
      swipeProgress.value = Math.min(
        Math.max(event.x, 0),
        containerWidth
      )
    }),
    [
      activeWidth,
      inactiveWidth,
      containerWidth,
    ]
  )

  const animStyles = useAnimatedStyle(() => {
    if (containerWidth <= 0) {
      return {}
    }

    const isOverScroll = totalWidth > containerWidth

    if (!isOverScroll) {
      return {
        transform: [
          {
            translateX: 0
          }
        ],
      }
    }

    return {
      transform: [
        {
          translateX: -interpolate(
            swipeProgress.value,
            [0, containerWidth],
            [0, totalWidth - containerWidth],
            Extrapolate.CLAMP
          )
        }
      ],
    }
  }, [
    containerWidth,
    totalWidth,
    containerWidth
  ])

  useAnimatedReaction(
    () => activeIndex.value,
    (activeIndex) => onIndexChange && runOnJS(onIndexChange)(activeIndex),
    [onIndexChange]
  )

  return <GestureDetector gesture={gesture}>
    <Animated.View style={{ width: '100%', overflow: "hidden" }}>
      <Animated.View style={[{ flexDirection: "row" }, style, animStyles]} onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
        {
          containerWidth > 0 && data.map((item, index) => {
            return <ThumbnailPaginationItem
              key={index}
              source={item}
              totalItems={data.length}
              swipeProgress={swipeProgress}
              containerWidth={containerWidth}
              activeIndex={activeIndex}
              activeWidth={activeWidth}
              itemGap={itemGap}
              inactiveWidth={inactiveWidth}
              totalWidth={totalWidth}
              index={index}
              style={{ marginRight: itemGap }}
              onSwipe={() => {
                console.log(`${item} swiped`)
              }}
            />
          })
        }
      </Animated.View>
    </Animated.View>
  </GestureDetector >
}

const ThumbnailPaginationItem: React.FC<{
  source: ImageSourcePropType;
  containerWidth: number;
  totalItems: number;
  activeIndex: Animated.SharedValue<number>;
  swipeProgress: Animated.SharedValue<number>;
  activeWidth: number;
  totalWidth: number;
  inactiveWidth: number;
  itemGap: number;
  index: number;
  onSwipe?: () => void;
  style?: ViewStyle
}> = ({
  source,
  containerWidth,
  totalItems,
  swipeProgress,
  index,
  itemGap = 0,
  activeIndex,
  activeWidth,
  totalWidth,
  inactiveWidth,
  style
}) => {
    const isActive = useSharedValue(0);

    useAnimatedReaction(
      () => {
        const onTheRight = index >= activeIndex.value
        const extraWidth = onTheRight ? activeWidth - inactiveWidth : 0

        const inputRange = [
          index * (inactiveWidth + itemGap) + (index === activeIndex.value ? 0 : extraWidth) - 0.1,
          index * (inactiveWidth + itemGap) + (index === activeIndex.value ? 0 : extraWidth),
          (index + 1) * (inactiveWidth + itemGap) + extraWidth,
          (index + 1) * (inactiveWidth + itemGap) + extraWidth + 0.1,
        ]

        return interpolate(
          swipeProgress.value / containerWidth * totalWidth,
          inputRange,
          [
            0,
            1,
            1,
            0
          ],
          Extrapolate.CLAMP
        )

      },
      (_isActiveAnimVal) => {
        isActive.value = _isActiveAnimVal
      },
      [
        containerWidth,
        totalItems,
        index,
        activeIndex,
        activeWidth,
        inactiveWidth,
        itemGap,
      ]
    )

    useAnimatedReaction(
      () => {
        return isActive.value
      },
      (isActiveVal) => {
        if (isActiveVal === 1) {
          activeIndex.value = index
        }
      },
      []
    )

    const animStyles = useAnimatedStyle(() => {
      const widthAnimVal = interpolate(
        isActive.value,
        [
          0, 1, 1, 0
        ],
        [
          inactiveWidth,
          activeWidth,
          activeWidth,
          inactiveWidth
        ],
        Extrapolate.CLAMP
      )

      return {
        width: withTiming(widthAnimVal, { duration: 100, easing: Easing.bounce }),
        height: 30,
        borderRadius: 5,
        overflow: "hidden",
      }
    }, [
      isActive,
      activeWidth,
      inactiveWidth,
    ])

    return <Animated.View style={[animStyles, style]}>
      <Image source={source} style={{ width: '100%', height: "100%" }} />
    </Animated.View>
  }

export default Index;
