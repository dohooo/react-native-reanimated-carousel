import * as React from 'react';
import { View, Text } from 'react-native-ui-lib';
import Carousel from 'react-native-reanimated-carousel';
import SButton from '../components/SButton';
import { ElementsText, window } from '../constants';
import Animated, { Easing } from 'react-native-reanimated';

const PAGE_WIDTH = window.width / 2;

function ReactionContainer(props: {
    text: string;
    children: (
        text: React.ReactElement,
        layout?: { width: number }
    ) => React.ReactElement;
}) {
    const [width, setWidth] = React.useState<number>();
    const [layout, setLayout] = React.useState<{ width: number }>();

    React.useEffect(() => {
        if (typeof width === 'number') {
            setLayout({ width });
        }
    }, [width]);

    React.useEffect(() => {
        setLayout(undefined);
    }, [props.text]);

    const text = (
        <Animated.View
            style={[
                {
                    flexWrap: 'wrap',
                    width: layout?.width,
                },
            ]}
        >
            <Text
                onLayout={({ nativeEvent }) => {
                    if (typeof layout === 'undefined') {
                        setWidth(nativeEvent.layout.width);
                    }
                }}
            >
                {props.text}
            </Text>
        </Animated.View>
    );

    return React.cloneElement(props.children(text, layout), {
        key: props.text,
    });
}

function Index() {
    const [isVertical, setIsVertical] = React.useState(false);
    const [isFast, setIsFast] = React.useState(false);
    const [isAutoPlay, setIsAutoPlay] = React.useState(false);

    return (
        <ReactionContainer text="一二三四五六七八九十">
            {(text, layout) => {
                return (
                    <View style={{ flex: 1 }}>
                        <Carousel
                            width={layout?.width ?? PAGE_WIDTH}
                            height={30}
                            style={{
                                borderWidth: 1,
                                borderColor: 'red',
                                width: 200,
                            }}
                            enableSnap={false}
                            pagingEnabled={false}
                            loop
                            autoPlay
                            withAnimation={{
                                type: 'timing',
                                config: {
                                    duration: 10000,
                                    easing: Easing.linear,
                                },
                            }}
                            autoPlayInterval={0}
                            data={[...new Array(6).keys()]}
                            renderItem={() => text}
                        />
                        <SButton
                            onPress={() => {
                                setIsVertical(!isVertical);
                            }}
                        >
                            {isVertical ? 'Set horizontal' : 'Set Vertical'}
                        </SButton>
                        <SButton
                            onPress={() => {
                                setIsFast(!isFast);
                            }}
                        >
                            {isFast ? 'NORMAL' : 'FAST'}
                        </SButton>
                        <SButton
                            onPress={() => {
                                setIsAutoPlay(!isAutoPlay);
                            }}
                        >
                            {ElementsText.AUTOPLAY}:{`${isAutoPlay}`}
                        </SButton>
                    </View>
                );
            }}
        </ReactionContainer>
    );
}

export default Index;
