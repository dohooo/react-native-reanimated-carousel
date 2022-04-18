import * as React from 'react';
import { View } from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import SButton from '../components/SButton';
import { SBItem } from '../components/SBItem';
import { ElementsText, window } from '../constants';

const PAGE_WIDTH = window.width;
const colors = [
    '#26292E',
    '#899F9C',
    '#B3C680',
    '#5C6265',
    '#F5D399',
    '#F1F1F1',
];

function Index() {
    const [isVertical, setIsVertical] = React.useState(false);
    const [autoPlay, setAutoPlay] = React.useState(false);
    const [pagingEnabled, setPagingEnabled] = React.useState<boolean>(true);
    const [snapEnabled, setSnapEnabled] = React.useState<boolean>(true);
    const progressValue = useSharedValue<number>(0);
    const baseOptions = isVertical
        ? ({
              vertical: true,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH * 0.6,
          } as const)
        : ({
              vertical: false,
              width: PAGE_WIDTH,
              height: PAGE_WIDTH * 0.6,
          } as const);

    return (
        <View
            style={{
                alignItems: 'center',
            }}
        >
            <Carousel
                {...baseOptions}
                loop
                pagingEnabled={pagingEnabled}
                snapEnabled={snapEnabled}
                autoPlay={autoPlay}
                autoPlayInterval={1500}
                onProgressChange={(_, absoluteProgress) =>
                    (progressValue.value = absoluteProgress)
                }
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                }}
                data={colors}
                renderItem={({ index }) => <SBItem index={index} />}
            />
            {!!progressValue && (
                <Pagination length={colors.length} progressValue={progressValue} />
            )}
            <SButton
                onPress={() => setAutoPlay(!autoPlay)}
            >{`${ElementsText.AUTOPLAY}:${autoPlay}`}</SButton>
            <SButton
                onPress={() => {
                    setIsVertical(!isVertical);
                }}
            >
                {isVertical ? 'Set horizontal' : 'Set Vertical'}
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
    );
}


export default Index;
