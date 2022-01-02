import * as React from 'react';
import { Dimensions } from 'react-native';
import { View } from 'react-native-ui-lib';
import Carousel from '../../../src/index';
import type { StackAnimationConfig } from '../../../src/layouts/StackLayout';
import { SBImageItem } from '../components/SBImageItem';
import SButton from '../components/SButton';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

function Index() {
    const [mode, setMode] = React.useState<'horizontal' | 'vertical'>(
        'horizontal'
    );
    const [snapDirection, setSnapDirection] = React.useState<'left' | 'right'>(
        'left'
    );
    const [pagingEnabled, setPagingEnabled] = React.useState<boolean>(true);
    const [enableSnap, setEnableSnap] = React.useState<boolean>(true);
    const [loop, setLoop] = React.useState<boolean>(true);

    const animationConfig = React.useMemo<StackAnimationConfig>(() => {
        const basic = {
            mode,
            snapDirection,
        };
        if (mode === 'vertical') {
            return {
                ...basic,
                stackInterval: 8,
            };
        }
        return basic;
    }, [mode, snapDirection]);

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
                pagingEnabled={pagingEnabled}
                enableSnap={enableSnap}
                mode="stack"
                loop={loop}
                width={280}
                height={210}
                data={[...new Array(6).keys()]}
                animationConfig={animationConfig}
                renderItem={() => <SBImageItem />}
            />
            <SButton
                onPress={() => {
                    setLoop(!loop);
                }}
            >
                {`loop:${loop}`}
            </SButton>
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
            <SButton
                onPress={() => {
                    setPagingEnabled(!pagingEnabled);
                }}
            >
                {`pagingEnabled:${pagingEnabled}`}
            </SButton>
            <SButton
                onPress={() => {
                    setEnableSnap(!enableSnap);
                }}
            >
                {`enableSnap:${enableSnap}`}
            </SButton>
        </View>
    );
}

export default Index;
