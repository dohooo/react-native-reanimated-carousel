import React from 'react';
import { LongPressGestureHandler } from 'react-native-gesture-handler';
import { SBImageItem } from './SBImageItem';
import { SBTextItem } from './SBTextItem';
import Constants from 'expo-constants';
import Animated, { AnimateProps } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ViewProps } from 'react-native';

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>;
    index: number;
    pretty?: boolean;
}

export const SBItem: React.FC<Props> = (props) => {
    const { style, index, pretty, ...animatedViewProps } = props;
    // @ts-ignore
    const enablePretty = Constants.manifest.extra.enablePretty;
    const [isPretty, setIsPretty] = React.useState(pretty || enablePretty);
    return (
        <LongPressGestureHandler
            onActivated={() => {
                setIsPretty(!isPretty);
            }}
        >
            <Animated.View style={{ flex: 1 }} {...animatedViewProps}>
                {isPretty ? (
                    <SBImageItem style={style} />
                ) : (
                    <SBTextItem style={style} index={index} />
                )}
            </Animated.View>
        </LongPressGestureHandler>
    );
};
