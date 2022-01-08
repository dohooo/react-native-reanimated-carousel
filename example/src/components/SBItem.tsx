import React from 'react';
import { LongPressGestureHandler } from 'react-native-gesture-handler';
import { View } from 'react-native-ui-lib';
import { SBImageItem } from './SBImageItem';
import { SBTextItem } from './SBTextItem';
import Constants from 'expo-constants';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
    style?: StyleProp<ViewStyle>;
    index: number;
    pretty?: boolean;
}
export const SBItem: React.FC<Props> = ({ style, index, pretty }) => {
    // @ts-ignore
    const enablePretty = Constants.manifest.extra.enablePretty;
    const [isPretty, setIsPretty] = React.useState(pretty || enablePretty);
    return (
        <LongPressGestureHandler
            onActivated={() => {
                setIsPretty(!isPretty);
            }}
        >
            <View flex>
                {isPretty ? (
                    <SBImageItem style={style} />
                ) : (
                    <SBTextItem style={style} index={index} />
                )}
            </View>
        </LongPressGestureHandler>
    );
};
