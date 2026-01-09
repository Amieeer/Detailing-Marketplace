import React from 'react';
import { View, Text } from 'react-native';

const MapView = (props) => {
    console.log('Maps.web.js loaded - Web Maps Stub Active');
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
            <Text>Maps are not supported on web</Text>
        </View>
    );
};

export const Marker = () => null;
export const Callout = () => null;
export const Circle = () => null;
export const PROVIDER_GOOGLE = 'google';

export default MapView;
