import * as React from 'react';
import { interpolate } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import type { TAnimationStyle } from '../../../src/layouts/BaseLayout';
import { window } from '../constants';
import { useHeaderHeight } from '@react-navigation/elements';
import { Text, View } from 'react-native-ui-lib';
import { BlurView } from 'expo-blur';
import { faker } from '@faker-js/faker';
import { Image } from 'react-native';

function Index() {
    const headerHeight = useHeaderHeight();
    const scale = 0.9;

    const RIGHT_OFFSET = window.width * (1 - scale);

    const ITEM_WIDTH = window.width * scale;
    const ITEM_HEIGHT = 120;

    const PAGE_HEIGHT = window.height - headerHeight;
    const PAGE_WIDTH = window.width;

    const animationStyle: TAnimationStyle = React.useCallback(
        (value: number) => {
            'worklet';

            const translateY = interpolate(
                value,
                [-1, 0, 1],
                [-ITEM_HEIGHT, 0, ITEM_HEIGHT]
            );
            const right = interpolate(
                value,
                [-1, -0.2, 1],
                [RIGHT_OFFSET / 2, RIGHT_OFFSET, RIGHT_OFFSET / 3]
            );
            return {
                transform: [{ translateY }],
                right,
            };
        },
        [RIGHT_OFFSET]
    );

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={{
                    uri:
                        faker.image.nature(PAGE_WIDTH, PAGE_HEIGHT) +
                        '?random=' +
                        Math.random(),
                }}
                style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    position: 'absolute',
                }}
            />
            <BlurView
                intensity={80}
                tint="dark"
                style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    position: 'absolute',
                }}
            />
            <Carousel
                loop
                vertical
                style={{
                    justifyContent: 'center',
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                }}
                width={ITEM_WIDTH}
                pagingEnabled={false}
                height={ITEM_HEIGHT}
                data={[...new Array(10).keys()]}
                renderItem={({ index }) => {
                    return (
                        <View key={index} flex padding-10>
                            <View
                                flex
                                br20
                                row
                                spread
                                style={{
                                    alignItems: 'flex-start',
                                }}
                            >
                                <View row centerV>
                                    <Image
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
                                            marginRight: 5,
                                        }}
                                        source={{
                                            uri:
                                                faker.image.animals(20, 20) +
                                                '?random=' +
                                                Math.random(),
                                        }}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            maxWidth: ITEM_WIDTH * 0.3 - 40,
                                        }}
                                        white
                                    >
                                        {faker.animal.dog()}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        width: ITEM_WIDTH * 0.6,
                                        height: ITEM_HEIGHT - 20,
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Image
                                        style={{
                                            width: ITEM_WIDTH * 0.6,
                                            height: ITEM_HEIGHT - 20,
                                            borderRadius: 10,
                                            marginRight: 5,
                                        }}
                                        source={{
                                            uri:
                                                faker.image.nature(
                                                    Math.round(
                                                        ITEM_WIDTH * 0.6
                                                    ),
                                                    ITEM_HEIGHT - 20
                                                ) +
                                                '?random=' +
                                                Math.random(),
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    );
                }}
                customAnimation={animationStyle}
            />
        </View>
    );
}

export default Index;
