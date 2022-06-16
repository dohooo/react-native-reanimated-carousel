import React from 'react';
import {
    StyleSheet,
    View,
    Image,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
} from 'react-native';

interface Props {
    style?: StyleProp<ViewStyle>;
}

export const SBImageItem: React.FC<Props> = ({ style }) => {
    const uri = React.useRef(
        `https://picsum.photos/400/300?t=${new Date().getTime()}`
    );
    return (
        <View style={[styles.container, style]}>
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
        overflow: 'hidden',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});
