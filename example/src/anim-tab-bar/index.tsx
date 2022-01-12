import * as React from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Colors, View } from 'react-native-ui-lib';
import SButton from '../components/SButton';
import { ElementsText } from '../constants';
import { useToggleButton } from '../hooks/useToggleButton';

const window = Dimensions.get('window');
const PAGE_WIDTH = 60;
const PAGE_HEIGHT = 40;
const DATA = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function Index() {
    const r = React.useRef<ICarouselInstance>(null);
    const AutoPLay = useToggleButton({
        defaultValue: false,
        buttonTitle: ElementsText.AUTOPLAY,
    });

    return (
        <View style={{ flex: 1 }}>
            <View style={{ marginVertical: 100 }}>
                <Carousel
                    ref={r}
                    loop={false}
                    style={{
                        width: window.width,
                        height: PAGE_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.blue30,
                    }}
                    width={PAGE_WIDTH}
                    height={PAGE_HEIGHT}
                    data={DATA}
                    renderItem={({ item, animationValue }) => {
                        return (
                            <Item
                                animationValue={animationValue}
                                label={item}
                                onPress={() =>
                                    r.current?.scrollTo(animationValue.value)
                                }
                            />
                        );
                    }}
                    autoPlay={AutoPLay.status}
                />
            </View>
            {AutoPLay.button}
            <View
                style={{
                    marginTop: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                }}
            >
                <SButton onPress={() => r.current?.prev()}>{'Prev'}</SButton>
                <SButton onPress={() => r.current?.next()}>{'Next'}</SButton>
            </View>
        </View>
    );
}

export default Index;

interface Props {
    animationValue: Animated.SharedValue<number>;
    label: string;
    onPress?: () => void;
}

const Item: React.FC<Props> = (props) => {
    const { animationValue, label, onPress } = props;

    const translateY = useSharedValue(0);

    const containerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [0.5, 1, 0.5],
            Extrapolate.CLAMP
        );

        return {
            opacity,
        };
    }, [animationValue]);

    const labelStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [1, 1.25, 1],
            Extrapolate.CLAMP
        );

        const color = interpolateColor(
            animationValue.value,
            [-1, 0, 1],
            [Colors.grey30, Colors.blue30, Colors.grey30]
        );

        return {
            transform: [{ scale }, { translateY: translateY.value }],
            color,
        };
    }, [animationValue, translateY]);

    const onPressIn = React.useCallback(() => {
        translateY.value = withTiming(-8, { duration: 250 });
    }, [translateY]);

    const onPressOut = React.useCallback(() => {
        translateY.value = withTiming(0, { duration: 250 });
    }, [translateY]);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
        >
            <Animated.View
                style={[
                    {
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    containerStyle,
                ]}
            >
                <Animated.Text
                    style={[{ fontSize: 18, color: '#26292E' }, labelStyle]}
                >
                    {label}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};
