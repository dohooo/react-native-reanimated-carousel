import * as React from 'react';
import { View } from 'react-native-ui-lib';
import Carousel from '../../../src/index';
import type { StackAnimationConfig } from '../../../src/layouts/StackLayout';
import { SBImageItem } from '../components/SBImageItem';
import SButton from '../components/SButton';

function Index() {
    const [vertical, setVertical] = React.useState(false);
    const [snapDirection, setSnapDirection] = React.useState<'left' | 'right'>(
        'left'
    );
    const [pagingEnabled, setPagingEnabled] = React.useState<boolean>(true);
    const [enableSnap, setEnableSnap] = React.useState<boolean>(true);
    const [loop, setLoop] = React.useState<boolean>(true);
    const [autoPlay, setAutoPlay] = React.useState<boolean>(false);
    const [autoPlayReverse, setAutoPlayReverse] =
        React.useState<boolean>(false);

    const animationConfig = React.useMemo<StackAnimationConfig>(() => {
        const basic = {
            snapDirection,
        };
        if (vertical) {
            return {
                ...basic,
                stackInterval: 8,
            };
        }
        return basic;
    }, [vertical, snapDirection]);

    const baseOptions = vertical
        ? ({
              vertical: true,
              width: 280,
              height: 220,
          } as const)
        : ({
              vertical: false,
              width: 280,
              height: 220,
          } as const);

    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <Carousel
                {...baseOptions}
                style={{
                    width: '100%',
                    height: 240,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                pagingEnabled={pagingEnabled}
                enableSnap={enableSnap}
                mode="stack"
                loop={loop}
                autoPlay={autoPlay}
                autoPlayReverse={autoPlayReverse}
                data={[...new Array(6).keys()]}
                animationConfig={animationConfig}
                renderItem={() => <SBImageItem />}
            />
            <SButton
                onPress={() => {
                    setAutoPlay(!autoPlay);
                }}
            >
                {`autoPlay:${autoPlay}`}
            </SButton>
            <SButton
                onPress={() => {
                    setAutoPlayReverse(!autoPlayReverse);
                }}
            >
                {`autoPlayReverse:${autoPlayReverse}`}
            </SButton>
            <SButton
                onPress={() => {
                    setLoop(!loop);
                }}
            >
                {`loop:${loop}`}
            </SButton>
            <SButton
                onPress={() => {
                    setVertical(!vertical);
                }}
            >
                {`vertical:${vertical}`}
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
