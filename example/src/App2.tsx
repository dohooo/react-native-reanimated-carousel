import * as React from 'react';
import { TextInput, Button, StyleSheet, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedReaction,
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
    const [horizontal, setHorizontal] = React.useState(true);
    const [infinite, setInfinite] = React.useState(false);

    const panTranslation = useSharedValue(0);

    const inputRef = React.useRef<TextInput>(null);
    const updateInputText = React.useCallback((text: string) => {
        inputRef.current?.setNativeProps({
            text,
        });
    }, []);

    useAnimatedReaction(
        () => panTranslation.value,
        (v) => {
            runOnJS(updateInputText)(`offset: ${v.toFixed(2)}`);
        },
        [panTranslation.value, inputRef.current]
    );

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
                pagingEnabled
                horizontal={horizontal}
                style={styles.scrollview}
                translation={panTranslation}
                totalWidth={titles.length * PAGE_WIDTH}
                width={PAGE_WIDTH}
                count={titles.length}
            >
                {titles.map((title, index) => {
                    return (
                        <Page key={index} index={index}>
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
