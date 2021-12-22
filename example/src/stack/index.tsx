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
                style={{
                    height: PAGE_WIDTH,
                    width: PAGE_WIDTH,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'red',
                }}
                mode="stack"
                width={100}
                height={100}
                data={CAROUSEL_ITEMS}
                renderItem={(backgroundColor) => (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor,
                            borderRadius: 20,
                        }}
                    />
                )}
            />
        </View>
    );
}

export default Index;
