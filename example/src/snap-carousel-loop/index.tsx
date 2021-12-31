import * as React from 'react';
import { Dimensions, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { CAROUSEL_ITEMS } from '../contant';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

interface DataItem {
    text: string;
    backgroundColor: string;
}

function Index() {
    const r = React.useRef<Carousel<DataItem>>(null);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: '#f1f1f1',
                paddingTop: 100,
            }}
        >
            <View style={{ width: PAGE_WIDTH, height: 240 }}>
                <Carousel<DataItem>
                    ref={r}
                    loop
                    itemWidth={PAGE_WIDTH}
                    sliderWidth={PAGE_WIDTH}
                    // @ts-ignore
                    data={CAROUSEL_ITEMS}
                    windowSize={3}
                    // @ts-ignore
                    renderItem={({ item }) => (
                        <View
                            key={item}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: item,
                                padding: 16,
                            }}
                        />
                    )}
                />
            </View>
        </View>
    );
}

export default Index;
