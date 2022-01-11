import * as React from 'react';
import { Dimensions } from 'react-native';
import { Extrapolate, interpolate } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { View, Text } from 'react-native-ui-lib';
import type { TAnimationStyle } from '../../../src/layouts/BaseLayout';
import { ElementsText } from '../constants';
import { useToggleButton } from '../hooks/useToggleButton';

const window = Dimensions.get('window');
const PAGE_WIDTH = 40;
const PAGE_HEIGHT = 40;

function Index() {
    const AutoPLay = useToggleButton({
        defaultValue: false,
        buttonTitle: ElementsText.AUTOPLAY,
    });

    const animationStyle: TAnimationStyle = React.useCallback(
        (value: number) => {
            'worklet';

            const translateX = interpolate(
                value,
                [-1, 0, 1],
                [-PAGE_WIDTH, 0, PAGE_WIDTH]
            );

            const opacity = interpolate(
                value,
                [-1, 0, 1],
                [0.5, 1, 0.5],
                Extrapolate.CLAMP
            );

            const scale = interpolate(
                value,
                [-1, 0, 1],
                [0.8, 1.4, 0.8],
                Extrapolate.CLAMP
            );

            return {
                transform: [{ translateX }, { scale }],
                opacity,
            };
        },
        []
    );

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                loop={false}
                style={{
                    width: window.width,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 110,
                }}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                data={['周一', '周二', '周三', '周四', '周五', '周六', '周日']}
                renderItem={({ item }) => {
                    return (
                        <View center height={'100%'}>
                            <Text color={'#26292E'}>{item}</Text>
                        </View>
                    );
                }}
                autoPlay={AutoPLay.status}
                customAnimation={animationStyle}
            />
            {AutoPLay.button}
        </View>
    );
}

export default Index;
