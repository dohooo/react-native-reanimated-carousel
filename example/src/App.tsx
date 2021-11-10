/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Dimensions, Image, ImageSourcePropType, View } from 'react-native';
import Carousel from '../../src/index';
import type { ICarouselInstance } from '../../src/Carousel';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const data: ImageSourcePropType[] = [
    require('../assets/carousel-0.jpg'),
    require('../assets/carousel-1.jpg'),
    require('../assets/carousel-2.jpg'),
];

export default function App() {
    const progressValue = useSharedValue<number>(0);
    const r = React.useRef<ICarouselInstance | null>(null);
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'black',
                paddingTop: 100,
            }}
        >
            <View style={{ height: 300 }}>
                <Carousel<ImageSourcePropType>
                    defaultIndex={1}
                    ref={r}
                    width={width}
                    data={data}
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
                />
            </View>
            <View style={{ height: 300 }}>
                <Carousel<ImageSourcePropType>
                    onProgressChange={(_, absoluteProgress) => {
                        progressValue.value = absoluteProgress;
                    }}
                    mode="parallax"
                    width={width}
                    data={data}
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
                                    length={data.length}
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
    animValue: Animated.SharedValue<number>;
}> = (props) => {
    const { animValue, index, length } = props;
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
        <View
            style={{
                backgroundColor: 'white',
                width,
                height: width,
                borderRadius: 50,
                overflow: 'hidden',
            }}
        >
            <Animated.View
                style={[
                    { borderRadius: 50, backgroundColor: 'tomato', flex: 1 },
                    animStyle,
                ]}
            />
        </View>
    );
};
