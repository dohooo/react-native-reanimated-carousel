import * as React from 'react';
import { TextInput, Button, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { ScrollViewGesture } from '../../src/ScrollViewGesture';

const PAGE_WIDTH = 300;

const titles = [
    'Lead Configuration Producer',
    'Dynamic Infrastructure Liaison',
    'Forward Program Designer',
    'Chief Markets Developer',
    'Dynamic Marketing Coordinator',
    'Direct Assurance Specialist',
    'Human Group Orchestrator',
    'Principal Identity Specialist',
    'National Infrastructure Liaison',
];

export default function App() {
    const inputRef = React.useRef<TextInput>(null);
    const [horizontal, setHorizontal] = React.useState(true);
    const [infinite, setInfinite] = React.useState(false);

    const offset = useSharedValue(0);
    const translate = useSharedValue(0);

    return (
        <View style={styles.screen}>
            <Text style={[styles.info]}>{`horizontal: ${horizontal}`}</Text>
            <Text style={[styles.info]}>{`infinite: ${infinite}`}</Text>
            <TextInput
                ref={inputRef}
                editable={false}
                value="offset: 0"
                style={[styles.info]}
            />
            <ScrollViewGesture
                // infinite
                pagingEnabled
                horizontal={horizontal}
                style={styles.scrollview}
                onScroll={(scroll) => {
                    inputRef.current?.setNativeProps({
                        text: `offset: ${scroll.value.toFixed(2)}`,
                    });
                }}
                offset={offset}
                translate={translate}
            >
                {titles.map((title, index) => {
                    return (
                        <Page
                            horizontal={horizontal}
                            key={index}
                            index={index}
                            offset={offset}
                        >
                            <Text style={styles.title}>{title}</Text>
                        </Page>
                    );
                })}
            </ScrollViewGesture>
            <Button title="Horizontal" onPress={() => setHorizontal(true)} />
            <Button title="Vertical" onPress={() => setHorizontal(false)} />
            <Button title="Infinite" onPress={() => setInfinite(!infinite)} />
        </View>
    );
}

const Page: React.FC<{
    horizontal: boolean;
    offset: Animated.SharedValue<number>;
    index: number;
}> = (props) => {
    const { children, offset, index, horizontal } = props;

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            offset.value,
            [
                (index - 1) * PAGE_WIDTH,
                index * PAGE_WIDTH,
                (index + 1) * PAGE_WIDTH,
            ],
            [0.9, 1, 1]
        );

        const opacity = interpolate(
            offset.value,
            [
                (index - 4) * PAGE_WIDTH,
                (index - 3) * PAGE_WIDTH,
                index * PAGE_WIDTH,
                (index + 1) * PAGE_WIDTH,
                (index + 4) * PAGE_WIDTH,
            ],
            [0, 0.9, 1, 0.9, 0],
            Extrapolate.EXTEND
        );

        const translate = interpolate(
            offset.value,
            [
                (index - 1) * PAGE_WIDTH,
                index * PAGE_WIDTH,
                (index + 1) * PAGE_WIDTH,
            ],
            [-PAGE_WIDTH * 0.94, 0, 0]
        );

        const translateStyle = horizontal
            ? { translateX: translate }
            : { translateY: translate };

        return {
            transform: [translateStyle, { scale }],
            zIndex: -index,
            opacity,
        };
    }, [offset.value, index, horizontal]);

    return (
        <Animated.View style={[styles.page, animatedStyle]}>
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
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollviewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 50,
    },
    scrollview: {
        width: PAGE_WIDTH,
        height: PAGE_WIDTH,
        overflow: 'visible',
    },
    page: {
        width: PAGE_WIDTH,
        height: PAGE_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerPage: {
        width: PAGE_WIDTH * 0.7,
        height: PAGE_WIDTH * 0.7,
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
    info: {
        fontSize: 24,
        fontWeight: '300',
    },
});
