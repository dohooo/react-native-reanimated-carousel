import * as React from 'react';
import { Dimensions, View } from 'react-native';
import Carousel from '../../../src/index';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import SButton from '../components/SButton';
import { SBImageItem } from '../components/SBImageItem';
import { CAROUSEL_ITEMS } from '../contant';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const [isVertical, setIsVertical] = React.useState(false);
    const [autoPlay, setAutoPlay] = React.useState(false);
    const [pagingEnabled, setPagingEnabled] = React.useState<boolean>(true);
    const [enableSnap, setEnableSnap] = React.useState<boolean>(true);

    const progressValue = useSharedValue<number>(0);
    const baseOptions = isVertical
        ? ({
              vertical: true,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH * 0.6,
          } as const)
        : ({
              vertical: false,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH * 0.6,
          } as const);

    return (
        <View
            style={{
                alignItems: 'center',
            }}
        >
            <Carousel
                {...baseOptions}
                loop
                pagingEnabled={pagingEnabled}
                enableSnap={enableSnap}
                autoPlay={autoPlay}
                autoPlayInterval={1500}
                onProgressChange={(_, absoluteProgress) =>
                    (progressValue.value = absoluteProgress)
                }
                mode="parallax"
                animationConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                }}
                data={CAROUSEL_ITEMS}
                renderItem={() => <SBImageItem />}
            />
            {!!progressValue && (
                <View
                    style={
                        isVertical
                            ? {
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  width: 10,
                                  alignSelf: 'center',
                                  position: 'absolute',
                                  right: 5,
                                  top: 40,
                              }
                            : {
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  width: 100,
                                  alignSelf: 'center',
                              }
                    }
                >
                    {CAROUSEL_ITEMS.map((backgroundColor, index) => {
                        return (
                            <PaginationItem
                                backgroundColor={backgroundColor}
                                animValue={progressValue}
                                index={index}
                                key={index}
                                isRotate={isVertical}
                                length={CAROUSEL_ITEMS.length}
                            />
                        );
                    })}
                </View>
            )}
            <SButton
                onPress={() => setAutoPlay(!autoPlay)}
            >{`autoPlay:${autoPlay}`}</SButton>
            <SButton
                onPress={() => {
                    setIsVertical(!isVertical);
                }}
            >
                {isVertical ? 'Set horizontal' : 'Set Vertical'}
            </SButton>
            <SButton
                onPress={() => {
                    setPagingEnabled(!pagingEnabled);
                }}
            >
                {`pagingEnabled:${pagingEnabled}`}
            </SButton>
            <SButton
                onPress={() => {
                    setEnableSnap(!enableSnap);
                }}
            >
                {`enableSnap:${enableSnap}`}
            </SButton>
        </View>
    );
}

const PaginationItem: React.FC<{
    index: number;
    backgroundColor: string;
    length: number;
    animValue: Animated.SharedValue<number>;
    isRotate?: boolean;
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
                        Extrapolate.CLAMP
                    ),
                },
            ],
        };
    }, [animValue, index, length]);
    return (
        <View
            style={{
                backgroundColor: 'white',
                width,
                height: width,
                borderRadius: 50,
                overflow: 'hidden',
                transform: [
                    {
                        rotateZ: isRotate ? '90deg' : '0deg',
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
