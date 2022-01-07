import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-ui-lib';

export const SBTextItem: React.FC<{ index: number }> = ({ index }) => {
    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 30 }} color="black">
                {index}
            </Text>
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
