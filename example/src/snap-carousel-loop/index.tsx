import * as React from 'react';
import { Dimensions, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { SBImageItem } from '../components/SBImageItem';
import SButton from '../components/SButton';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const r = React.useRef<Carousel<number>>(null);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#f1f1f1',
                paddingTop: 100,
            }}
        >
            <View style={{ width: PAGE_WIDTH, height: 240 }}>
                <Carousel<number>
                    ref={r}
                    loop
                    itemWidth={PAGE_WIDTH}
                    sliderWidth={PAGE_WIDTH}
                    data={[...new Array(6).keys()]}
                    windowSize={3}
                    renderItem={() => <SBImageItem />}
                />
            </View>
            <View
                style={{
                    marginTop: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                }}
            >
                <SButton onPress={() => r.current?.snapToPrev()}>
                    {'Prev'}
                </SButton>
                <SButton onPress={() => r.current?.snapToNext()}>
                    {'Next'}
                </SButton>
            </View>
        </View>
    );
}

export default Index;
