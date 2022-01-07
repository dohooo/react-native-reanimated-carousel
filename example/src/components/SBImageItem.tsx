import React from 'react';
import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';

export const SBImageItem: React.FC = () => {
    const uri = React.useRef(
        `https://picsum.photos/400/300?t=${new Date().getTime()}`
    );
    return (
        <View style={styles.container}>
            <ActivityIndicator size="small" />
            <Image
                style={styles.image}
                source={{
                    uri: uri.current,
                }}
            />
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
    },
    image: {
        borderRadius: 4,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});
