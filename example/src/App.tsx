/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import {
    Button,
    Dimensions,
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
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
    const progressValue = useSharedValue<number>(0);
    const defaultCarouselRef = React.useRef<ICarouselInstance | null>(null);
    const parallaxCarouselRef = React.useRef<ICarouselInstance | null>(null);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                paddingTop: 50,
            }}
        >
            <View
                style={{
                    height: 240,
                }}
            >
                <Carousel
                    ref={defaultCarouselRef}
                    width={window.width}
                    data={data}
                    parallaxScrollingScale={0.8}
                    renderItem={(source) => (
                        <Image
                            source={source}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    )}
                />
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
            <View style={{ height: 300 }}>
                <Carousel
                    onProgressChange={(_, absoluteProgress) => {
                        progressValue.value = absoluteProgress;
                    }}
                    mode="parallax"
                    width={window.width}
                    data={titles}
                    ref={parallaxCarouselRef}
                    parallaxScrollingScale={0.9}
                    parallaxScrollingOffset={100}
                    renderItem={(title, index) => (
                        <Page key={index} index={index}>
                            <Text style={styles.title}>{title}</Text>
                        </Page>
                    )}
                />
                {!!progressValue && (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: 100,
                            alignSelf: 'center',
                            backgroundColor: '#0000001a',
                        }}
                    >
                        {data.map((_, index) => {
                            return (
                                <PaginationItem
                                    animValue={progressValue}
                                    index={index}
                                    key={index}
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

const Page: React.FC<{
    index: number;
}> = (props) => {
    const { children, index } = props;

    return (
        <Animated.View
            style={[
                styles.innerPage,
                {
                    backgroundColor: `rgba(${255 - index * 30},240,120,1)`,
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

const PaginationItem: React.FC<{
    index: number;
    length: number;
    animValue: Animated.SharedValue<number>;
    onPress?: () => void;
}> = (props) => {
    const { onPress, animValue, index, length } = props;
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
                    height: width,
                    borderRadius: 50,
                    overflow: 'hidden',
                }}
            >
                <Animated.View
                    style={[
                        {
                            borderRadius: 50,
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

const styles = StyleSheet.create({
    innerPage: {
        width: window.width * 0.7,
        height: 280 * 0.7,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.15,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000aa',
    },
});

const titles = [
    'Arkansas',
    'feed',
    'Representative',
    'District',
    'withdrawal',
    'Avon',
    'parse',
    'Strategist',
    'Implementation',
    'USB',
    'Norwegian',
    'optimizing',
];
