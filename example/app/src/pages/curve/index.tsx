import * as React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

import { SBItem } from "../../components/SBItem";
import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";
import { withAnchorPoint } from "../../utils/anchor-point";

const PAGE_WIDTH = window.width / 5;
const colors = [
  "#26292E",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

function Index() {
  const [autoPlay, setAutoPlay] = React.useState(false);
  const progressValue = useSharedValue<number>(0);
  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH,
    height: PAGE_WIDTH * 0.6,
  } as const;

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <Carousel
        {...baseOptions}
        loop
        style={{
          height: window.width / 2,
          width: window.width,
          justifyContent: "center",
          alignItems: "center",
        }}
        autoPlay={autoPlay}
        autoPlayInterval={150}
        scrollAnimationDuration={600}
        onProgressChange={(_, absoluteProgress) =>
          (progressValue.value = absoluteProgress)
        }
        customAnimation={(value: number) => {
          "worklet";
          const size = PAGE_WIDTH;
          const scale = interpolate(
            value,
            [-2, -1, 0, 1, 2],
            [1.7, 1.2, 1, 1.2, 1.7],
            Extrapolate.CLAMP,
          );

          const translate = interpolate(
            value,
            [-2, -1, 0, 1, 2],
            [-size * 1.45, -size * 0.9, 0, size * 0.9, size * 1.45],
          );

          const transform = {
            transform: [
              { scale },
              {
                translateX: translate,
              },
              { perspective: 150 },
              {
                rotateY: `${interpolate(
                  value,
                  [-1, 0, 1],
                  [30, 0, -30],
                  Extrapolate.CLAMP,
                )}deg`,
              },
            ],
          };

          return {
            ...withAnchorPoint(
              transform,
              { x: 0.5, y: 0.5 },
              {
                width: baseOptions.width,
                height: baseOptions.height,
              },
            ),
          };
        }}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        data={colors}
        renderItem={({ index }) => <SBItem index={index} />}
      />
      {!!progressValue && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 100,
            marginTop: 10,
            alignSelf: "center",
          }}
        >
          {colors.map((backgroundColor, index) => {
            return (
              <PaginationItem
                backgroundColor={backgroundColor}
                animValue={progressValue}
                index={index}
                key={index}
                length={colors.length}
              />
            );
          })}
        </View>
      )}
      <SButton
        onPress={() => setAutoPlay(!autoPlay)}
      >{`${ElementsText.AUTOPLAY}:${autoPlay}`}</SButton>
    </View>
  );
}

const PaginationItem: React.FC<{
  index: number
  backgroundColor: string
  length: number
  animValue: Animated.SharedValue<number>
  isRotate?: boolean
}> = (props) => {
  const { animValue, index, length, backgroundColor, isRotate } = props;
  const width = 10;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [animValue, index, length]);
  return (
    <View
      style={{
        backgroundColor: "white",
        width,
        height: width,
        borderRadius: 50,
        overflow: "hidden",
        transform: [
          {
            rotateZ: isRotate ? "90deg" : "0deg",
          },
        ],
      }}
    >
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor,
            flex: 1,
          },
          animStyle,
        ]}
      />
    </View>
  );
};

export default Index;
