import * as React from 'react';
import { Dimensions } from 'react-native';
import { View } from 'react-native-ui-lib';
import Carousel from '../../../src/index';
import { CAROUSEL_ITEMS } from '../contant';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <Carousel
                mode="stack"
                width={PAGE_WIDTH}
                height={PAGE_WIDTH / 2}
                style={{ borderWidth: 1, borderColor: 'red' }}
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
