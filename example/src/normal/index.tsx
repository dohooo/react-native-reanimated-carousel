import * as React from 'react';
import { Dimensions, View } from 'react-native';
import Carousel from '../../../src/index';
import { CAROUSEL_ITEMS } from '../contant';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    return (
        <View style={{ width: PAGE_WIDTH, height: 240 }}>
            <Carousel
                defaultIndex={0}
                width={PAGE_WIDTH}
                parallaxScrollingScale={0.8}
                data={CAROUSEL_ITEMS}
                renderItem={(backgroundColor) => (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor,
                        }}
                    />
                )}
            />
        </View>
    );
}

export default Index;
