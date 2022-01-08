import * as React from 'react';
import { Dimensions, View } from 'react-native';
import { interpolate } from 'react-native-reanimated';
import Carousel from '../../../src/index';
import type { TAnimationStyle } from '../../../src/layouts/BaseLayout';
import { SBItem } from '../components/SBItem';
import SButton from '../components/SButton';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const [isAutoPlay, setIsAutoPlay] = React.useState(false);
    const animationStyle: TAnimationStyle = React.useCallback(
        (value: number) => {
            'worklet';

            const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
            const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
            const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

            return {
                transform: [{ scale }],
                zIndex,
                opacity,
            };
        },
        []
    );

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                loop
                style={{
                    width: PAGE_WIDTH,
                    height: 240,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                autoPlay={isAutoPlay}
                width={PAGE_WIDTH * 0.7}
                height={240 * 0.7}
                data={[...new Array(6).keys()]}
                renderItem={({ index }) => {
                    return <SBItem key={index} index={index} />;
                }}
                customAnimation={animationStyle}
            />
            <SButton
                onPress={() => {
                    setIsAutoPlay(!isAutoPlay);
                }}
            >
                AutoPlay:{`${isAutoPlay}`}
            </SButton>
        </View>
    );
}

export default Index;
