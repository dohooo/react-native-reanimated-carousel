import * as React from 'react';
import { View } from 'react-native-ui-lib';
import Carousel from 'react-native-reanimated-carousel';
import { SBItem } from '../components/SBItem';
import SButton from '../components/SButton';
import { ElementsText } from '../constants';

function Index() {
    const [mode, setMode] = React.useState<any>('horizontal-stack');
    const [snapDirection, setSnapDirection] = React.useState<'left' | 'right'>(
        'left'
    );
    const [pagingEnabled, setPagingEnabled] = React.useState<boolean>(true);
    const [snapEnabled, setSnapEnabled] = React.useState<boolean>(true);
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
                width={280}
                height={210}
                pagingEnabled={pagingEnabled}
                snapEnabled={snapEnabled}
                mode={mode}
                loop={loop}
                autoPlay={autoPlay}
                autoPlayReverse={autoPlayReverse}
                data={[...new Array(6).keys()]}
                modeConfig={{
                    snapDirection,
                    stackInterval: mode === 'vertical-stack' ? 8 : 18,
                }}
                renderItem={({ index }) => <SBItem index={index} key={index} />}
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
                    {`${ElementsText.AUTOPLAY}:${autoPlay}`}
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
                        setSnapEnabled(!snapEnabled);
                    }}
                >
                    {`snapEnabled:${snapEnabled}`}
                </SButton>
            </View>
        </View>
    );
}

export default Index;
