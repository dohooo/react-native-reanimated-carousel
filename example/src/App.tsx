/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Button, Image, ImageSourcePropType, View } from 'react-native';
import Carousel from '../../src/index';
import type { ICarouselInstance } from '../../src/types';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

const data: ImageSourcePropType[] = [
    require('../assets/carousel-0.jpg'),
    require('../assets/carousel-1.jpg'),
    require('../assets/carousel-2.jpg'),
];

export default function App() {
    const r = React.useRef<ICarouselInstance | null>(null);
    const progressValue = useSharedValue<number>(0);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'black',
                paddingTop: 100,
            }}
        >
            <Carousel
                style={{ height: 240 }}
                defaultIndex={0}
                ref={r}
                vertical
                height={240}
                parallaxScrollingScale={0.8}
                data={data}
                renderItem={(source, index) => {
                    return (
                        <Image
                            key={index}
                            source={source}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    );
                }}
            />
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
                        r.current?.prev();
                    }}
                />
                <Button
                    title="Next"
                    onPress={() => {
                        r.current?.next();
                    }}
                />
            </View>
            <Carousel
                style={{ height: 240 }}
                onProgressChange={(_, absoluteProgress) => {
                    progressValue.value = absoluteProgress;
                }}
                vertical
                mode="parallax"
                height={240}
                parallaxScrollingScale={0.8}
                data={data}
                renderItem={(source, i) => {
                    return (
                        <Image
                            key={i}
                            source={source}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    );
                }}
            />
            {!!progressValue && (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: 100,
                        alignSelf: 'center',
                        marginTop: 8,
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
