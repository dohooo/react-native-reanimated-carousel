import * as React from 'react';
import { Image, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Text, View } from 'react-native-ui-lib';

export const QRCode: React.FC<{ tintColor?: string }> = ({ tintColor }) => {
    const [visible, setVisible] = React.useState(false);
    return (
        <TouchableWithoutFeedback
            onPress={() => {
                setVisible(!visible);
            }}
        >
            <View>
                <Text color={tintColor}>{'QR CODE'}</Text>
                {visible && (
                    <View style={styles.qrCodeContainer}>
                        <Image
                            // @ts-ignore
                            style={styles.qrCodeImage}
                            source={require('../../assets/web-example-qrcode.png')}
                        />
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    qrCodeContainer: {
        position: 'absolute',
        bottom: -10,
        // @ts-ignore
        transform: [{ translateY: '100%' }],
        height: 200,
        width: 200,
        right: 0,
    },
    qrCodeImage: {
        flex: 1,
        borderRadius: 5,
        borderWidth: 3,
        borderColor: '#26292E',
    },
});
