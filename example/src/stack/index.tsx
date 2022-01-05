import * as React from 'react';
import { View } from 'react-native-ui-lib';
import Carousel from '../../../src/index';
import { SBImageItem } from '../components/SBImageItem';
import SButton from '../components/SButton';

function Index() {
    const [mode, setMode] = React.useState<any>('stack');
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

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                style={{
                    width: '100%',
                    height: 240,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                vertical={mode !== 'stack' ? false : vertical}
                width={280}
                height={210}
                pagingEnabled={pagingEnabled}
                enableSnap={enableSnap}
                mode={mode}
                loop={loop}
                autoPlay={autoPlay}
                autoPlayReverse={autoPlayReverse}
                data={[...new Array(6).keys()]}
                animationConfig={{
                    snapDirection,
                    stackInterval:
                        mode === 'stack' ? (vertical ? 8 : 18) : undefined,
                }}
                showLength={4}
                renderItem={() => <SBImageItem />}
            />
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                }}
            >
                <SButton
                    onPress={() => {
                        setMode('stack');
                    }}
                >
                    {'stack'}
                </SButton>
                <SButton
                    onPress={() => {
                        setMode('horizontal-stack');
                    }}
                >
                    {'horizontal-stack'}
                </SButton>
                <SButton
                    onPress={() => {
                        setMode('vertical-stack');
                    }}
                >
                    {'vertical-stack'}
                </SButton>
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
                    visible={mode === 'stack'}
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
        </View>
    );
}

export default Index;
