import * as React from 'react';
import { Dimensions } from 'react-native';
import { View } from 'react-native-ui-lib';
import Carousel from '../../../src/index';
import SButton from '../components/SButton';
import { CAROUSEL_ITEMS } from '../contant';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const [mode, setMode] = React.useState<'horizontal' | 'vertical'>(
        'horizontal'
    );
    const [snapDirection, setSnapDirection] = React.useState<'left' | 'right'>(
        'left'
    );
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
                }}
                mode="stack"
                autoPlay
                width={PAGE_WIDTH / 2}
                height={PAGE_WIDTH / 2}
                data={CAROUSEL_ITEMS}
                animationConfig={{
                    mode,
                    snapDirection,
                }}
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
            <SButton
                onPress={() => {
                    setMode(mode === 'horizontal' ? 'vertical' : 'horizontal');
                }}
            >
                {mode}
            </SButton>
            <SButton
                onPress={() => {
                    setSnapDirection(
                        snapDirection === 'left' ? 'right' : 'left'
                    );
                }}
            >
                {snapDirection}
            </SButton>
        </View>
    );
}

export default Index;
