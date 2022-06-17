import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
    style?: StyleProp<ViewStyle>;
    index: number;
}

export const SBTextItem: React.FC<Props> = ({ style, index }) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={{ fontSize: 30, color: 'black' }}>{index}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'red',
    },
});
