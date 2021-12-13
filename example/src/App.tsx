/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import {
    Button,
    Dimensions,
    Image,
    ImageSourcePropType,
    View,
} from 'react-native';
import Carousel from '../../src/index';
import type { ICarouselInstance } from '../../src/Carousel';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const window = Dimensions.get('window');

const data: ImageSourcePropType[] = [
    require('../assets/carousel-0.jpg'),
    require('../assets/carousel-1.jpg'),
    require('../assets/carousel-2.jpg'),
];

export default function App() {
    const currentValue = useSharedValue<number>(0);
    const progressValue = useSharedValue<number>(0);
    const defaultCarouselRef = React.useRef<ICarouselInstance | null>(null);
    const parallaxCarouselRef = React.useRef<ICarouselInstance | null>(null);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'black',
                paddingTop: 50,
            }}
        >
            <View
                style={{
                    height: 240,
                }}
            >
                <Carousel<ImageSourcePropType>
                    onProgressChange={(_, absoluteProgress) => {
                        currentValue.value = absoluteProgress;
                    }}
                    ref={defaultCarouselRef}
                    width={window.width}
                    data={data}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                    parallaxScrollingScale={0.8}
                    renderItem={(source) => (
                        <View style={{ flex: 1 }}>
                            <Image
                                source={source}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </View>
                    )}
                >
                    {!!currentValue && (
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 5,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: 100,
                                alignSelf: 'center',
                            }}
                        >
                            {data.map((_, index) => {
                                return (
                                    <PaginationItem
                                        animValue={currentValue}
                                        index={index}
                                        key={index}
                                        height={5}
                                        type="rectangle"
                                        length={data.length}
                                        onPress={() => {
                                            defaultCarouselRef.current?.goToIndex(
                                                index,
                                                true
                                            );
                                        }}
                                    />
                                );
                            })}
                        </View>
                    )}
                </Carousel>
            </View>
            <View
                style={{
                    marginTop: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                }}
            >
                <Button
                    title="Prev"
                    onPress={() => {
                        defaultCarouselRef.current?.prev();
                    }}
                />
                <Button
                    title="Next"
                    onPress={() => {
                        defaultCarouselRef.current?.next();
                    }}
                />
            </View>
            <View style={{ height: 240 }}>
                <Carousel<ImageSourcePropType>
                    onProgressChange={(_, absoluteProgress) => {
                        progressValue.value = absoluteProgress;
                    }}
                    mode="parallax"
                    width={window.width}
                    data={data}
                    ref={parallaxCarouselRef}
                    parallaxScrollingScale={0.8}
                    renderItem={(source) => (
                        <View style={{ flex: 1 }}>
                            <Image
                                source={source}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 15,
                                }}
                            />
                        </View>
                    )}
                />
                {!!progressValue && (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: 100,
                            alignSelf: 'center',
                        }}
                    >
                        {data.map((_, index) => {
                            return (
                                <PaginationItem
                                    animValue={progressValue}
                                    index={index}
                                    key={index}
                                    type="circle"
                                    length={data.length}
                                    onPress={() => {
                                        parallaxCarouselRef.current?.goToIndex(
                                            index,
                                            true
                                        );
                                    }}
                                />
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}

const PaginationItem: React.FC<{
    index: number;
    length: number;
    height?: number;
    animValue: Animated.SharedValue<number>;
    type: 'circle' | 'rectangle';
    onPress?: () => void;
}> = (props) => {
    const { onPress, animValue, index, length, type, height = 20 } = props;
    const width = 20;

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
        <TouchableWithoutFeedback
            containerStyle={{ flex: 1 }}
            onPress={onPress}
        >
            <View
                style={{
                    backgroundColor: 'white',
                    width,
                    height,
                    borderRadius: type === 'circle' ? 50 : 0,
                    overflow: 'hidden',
                }}
            >
                <Animated.View
                    style={[
                        {
                            backgroundColor: 'tomato',
                            flex: 1,
                        },
                        animStyle,
                    ]}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};
