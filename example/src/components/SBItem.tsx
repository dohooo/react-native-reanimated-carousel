import React from 'react';
import { LongPressGestureHandler } from 'react-native-gesture-handler';
import { View } from 'react-native-ui-lib';
import { SBImageItem } from './SBImageItem';
import { SBTextItem } from './SBTextItem';
import Constants from 'expo-constants';

export const SBItem: React.FC<{ index: number }> = ({ index }) => {
    // @ts-ignore
    const enablePretty = Constants.manifest.extra.enablePretty;
    const [isPretty, setIsPretty] = React.useState(enablePretty);
    return (
        <LongPressGestureHandler
            onActivated={() => {
                setIsPretty(!isPretty);
            }}
        >
            <View flex>
                {isPretty ? <SBImageItem /> : <SBTextItem index={index} />}
            </View>
        </LongPressGestureHandler>
    );
};
