import * as React from 'react';
import { Dimensions, View } from 'react-native';
import Carousel from '../../../src/index';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { CAROUSEL_ITEMS } from '../contant';
import SButton from '../components/SButton';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const [isVertical, setIsVertical] = React.useState(false);
    const progressValue = useSharedValue<number>(0);
    const baseOptions = isVertical
        ? ({
              vertical: true,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH / 2,
          } as const)
        : ({
              vertical: false,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH / 2,
          } as const);
    return (
        <View
            style={{
                height: 240,
                alignItems: 'center',
            }}
        >
            <Carousel
                {...baseOptions}
                loop
                autoPlay
                autoPlayInterval={1000}
                onProgressChange={(_, absoluteProgress) =>
                    (progressValue.value = absoluteProgress)
                }
                mode="parallax"
                parallaxScrollingScale={0.8}
                data={CAROUSEL_ITEMS}
                renderItem={(backgroundColor) => (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor,
                            borderRadius: 10,
                            shadowColor: 'black',
                            shadowOpacity: 0.2,
                            shadowRadius: 10,
                        }}
                    />
                )}
            />
            {!!progressValue && (
                <View
                    style={{
                        flexDirection: isVertical ? 'column' : 'row',
                        justifyContent: 'space-between',
                        width: isVertical ? 10 : 100,
                        alignSelf: 'center',
                        position: 'absolute',
                        right: isVertical ? 10 : undefined,
                        top: isVertical ? 40 : 185,
                    }}
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
                onPress={() => {
                    setIsVertical(!isVertical);
                }}
            >
                {isVertical ? 'Set horizontal' : 'Set Vertical'}
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
