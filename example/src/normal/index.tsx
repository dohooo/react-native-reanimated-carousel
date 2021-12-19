import * as React from 'react';
import { Dimensions } from 'react-native';
import { View } from 'react-native-ui-lib';
import Carousel from '../../../src/index';
import SButton from '../components/SButton';
import { CAROUSEL_ITEMS } from '../contant';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const [isVertical, setIsVertical] = React.useState(false);
    const [isFast, setIsFast] = React.useState(false);

    const baseOptions = isVertical
        ? ({
              vertical: true,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH / 2,
          } as const)
        : ({
              vertical: false,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH / 2,
          } as const);

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                {...baseOptions}
                loop
                autoPlay
                autoPlayInterval={isFast ? 100 : 1000}
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
        </View>
    );
}

export default Index;
