import * as React from 'react';
import { Image, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import type { ICarouselInstance } from '../../../src/types';
import SButton from '../components/SButton';
import { window } from '../constants';

const PAGE_WIDTH = window.width;

function Item({ index }: { index: number }) {
    return (
        <View
            key={index}
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16,
            }}
        >
            <View>
                <Image
                    source={require('../../assets/fruit-0.png')}
                    style={{ width: 100, height: 100 }}
                    resizeMode={'contain'}
                />
            </View>
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={{
                        backgroundColor: '#ff7a45',
                        padding: 10,
                        borderRadius: 10,
                        margin: 10,
                        justifyContent: 'center',
                    }}
                >
                    <Text>Test</Text>
                </View>
                <View
                    style={{
                        backgroundColor: '#ff7a45',
                        padding: 10,
                        borderRadius: 10,
                        margin: 10,
                        justifyContent: 'center',
                    }}
                >
                    <Text>
                        Some{'\n'}Multiline{'\n'}Text
                    </Text>
                </View>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    // remove this and the row shows properly
                    flex: 1,
                }}
            >
                <View
                    style={{
                        backgroundColor: '#ff7a45',
                        padding: 10,
                        borderRadius: 10,
                        margin: 10,
                        justifyContent: 'center',
                    }}
                >
                    <Text>Test</Text>
                </View>
                <View
                    style={{
                        backgroundColor: '#ff7a45',
                        padding: 10,
                        borderRadius: 10,
                        margin: 10,
                        justifyContent: 'center',
                    }}
                >
                    <Text>
                        Some{'\n'}Multiline{'\n'}Text
                    </Text>
                </View>
            </View>
        </View>
    );
}

function Index() {
    const r = React.useRef<ICarouselInstance | null>(null);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#f1f1f1',
                paddingTop: 100,
            }}
        >
            <View style={{ width: PAGE_WIDTH, height: 240 }}>
                <Carousel
                    defaultIndex={0}
                    ref={r}
                    width={PAGE_WIDTH}
                    data={[...new Array(50).keys()]}
                    mode="parallax"
                    windowSize={3}
                    renderItem={({ index }) => (
                        <Item key={index} index={index} />
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
                <SButton onPress={() => r.current?.prev()}>{'Prev'}</SButton>
                <SButton onPress={() => r.current?.next()}>{'Next'}</SButton>
            </View>
        </View>
    );
}

export default Index;
