import React from 'react';
import { InputAccessoryView, View, Button, StyleSheet, Keyboard, Platform } from 'react-native';

const KeyboardToolbar = ({ nativeID = 'keyboardToolbar' }) => {
    if (Platform.OS !== 'ios') return null;

    return (
        <InputAccessoryView nativeID={nativeID}>
            <View style={styles.container}>
                <View style={styles.spacer} />
                <Button title="Done" onPress={Keyboard.dismiss} />
            </View>
        </InputAccessoryView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 44,
    },
    spacer: {
        flex: 1,
    },
});

export default KeyboardToolbar;
