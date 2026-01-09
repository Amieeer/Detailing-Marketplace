import React, { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    ScrollView,
    Button,
    ButtonText,
    Spinner,
    Center,
    Divider,
    Icon,
    Pressable
} from '@gluestack-ui/themed';
import { MapPinIcon, NavigationIcon } from 'lucide-react-native';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import MapView, { Marker, PROVIDER_GOOGLE } from '../components/Maps';
import { midnightMapStyle } from '../constants/mapStyle';

const JobExecutionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { bookingId } = route.params;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [beforePhotos, setBeforePhotos] = useState([]);
    const [afterPhotos, setAfterPhotos] = useState([]);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/bookings/${bookingId}`);
            const found = res.data;

            if (found) {
                setBooking(found);
                setBeforePhotos(found.before_photos || []);
                setAfterPhotos(found.after_photos || []);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load booking details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const handlePhotoUpload = async (type, url) => {
        try {
            const endpoint = `/bookings/${bookingId}/photos`;
            await api.post(endpoint, { type, url });

            if (type === 'before') {
                setBeforePhotos(prev => [...prev, url]);
            } else {
                setAfterPhotos(prev => [...prev, url]);
            }
            Alert.alert('Success', 'Photo uploaded!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save photo');
        }
    };

    const handleStatusUpdate = async (action) => {
        try {
            await api.patch(`/bookings/${bookingId}/${action}`);
            fetchBooking();
            Alert.alert('Success', `Job ${action === 'start' ? 'started' : 'completed'}!`);
            if (action === 'complete') {
                navigation.goBack();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Failed to ${action} job`);
        }
    };

    const openMaps = () => {
        if (!booking?.location_coordinates) return;
        const { x: lat, y: lng } = booking.location_coordinates; // Postgres point is (x,y) -> (lat,lng) usually but check schema. Actually point is (x,y) -> (lon, lat) in PostGIS often, but here we likely stored as {latitude, longitude} JSON or similar.
        // Wait, let's check how it's stored. In BookingScreen we sent {latitude, longitude}.
        // The backend likely stores it as JSONB or separate columns.
        // Let's assume it comes back as { x: lat, y: lon } or { latitude, longitude } depending on how the backend returns it.
        // Looking at userController, we didn't see booking controller.
        // Let's assume standard { latitude, longitude } object for now based on BookingScreen.

        const latitude = booking.location_coordinates?.latitude || booking.location_coordinates?.x;
        const longitude = booking.location_coordinates?.longitude || booking.location_coordinates?.y;

        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${latitude},${longitude}`;
        const label = booking.location_address;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url);
    };

    if (loading || !booking) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <Spinner size="large" color="$primary500" />
            </Center>
        );
    }

    // Parse coordinates safely
    const latitude = parseFloat(booking.location_coordinates?.latitude || booking.location_coordinates?.x || 0);
    const longitude = parseFloat(booking.location_coordinates?.longitude || booking.location_coordinates?.y || 0);
    const hasCoordinates = latitude !== 0 && longitude !== 0;

    return (
        <Box flex={1} bg="$backgroundDark">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <HStack justifyContent="space-between" alignItems="center" mb="$6">
                    <Heading size="xl" color="$textLight">Job #{booking.id}</Heading>
                    <Box bg="$primary500" px="$3" py="$1" rounded="$md">
                        <Text color="$black" fontWeight="bold" size="xs">{booking.status.toUpperCase()}</Text>
                    </Box>
                </HStack>

                {/* Map Section */}
                {hasCoordinates && (
                    <Box mb="$6" height={200} rounded="$xl" overflow="hidden" borderWidth={1} borderColor="$secondary900">
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{ flex: 1 }}
                            customMapStyle={midnightMapStyle}
                            initialRegion={{
                                latitude: latitude,
                                longitude: longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker coordinate={{ latitude, longitude }}>
                                <Icon as={MapPinIcon} size="xl" color="$primary500" fill="rgba(0, 229, 255, 0.2)" />
                            </Marker>
                        </MapView>
                        <Pressable
                            onPress={openMaps}
                            position="absolute"
                            bottom={10}
                            right={10}
                            bg="$primary500"
                            p="$2"
                            rounded="$lg"
                            flexDirection="row"
                            alignItems="center"
                        >
                            <Icon as={NavigationIcon} size="xs" color="$white" mr="$1" />
                            <Text color="$white" size="xs" fontWeight="bold">Navigate</Text>
                        </Pressable>
                    </Box>
                )}

                <Box bg="$backgroundCard" p="$4" rounded="$xl" mb="$6" borderWidth={1} borderColor="$secondary900">
                    <Heading size="md" color="$textLight" mb="$3">Service Details</Heading>
                    <VStack space="sm">
                        <Text color="$textDim">{booking.service_name}</Text>
                        <Text color="$textDim">Price: ${booking.total_price}</Text>
                        <Text color="$textDim">Address: {booking.location_address}</Text>
                    </VStack>
                </Box>

                {/* Before Photos */}
                <Box mb="$6">
                    <Heading size="md" color="$textLight" mb="$3">Before Photos</Heading>
                    <HStack flexWrap="wrap" space="sm" style={{ gap: 10 }}>
                        {beforePhotos.map((url, index) => (
                            <ImageUpload key={`before-${index}`} initialImage={url} label="Before" />
                        ))}
                        <ImageUpload
                            label="Add Before Photo"
                            onImageUploaded={(url) => handlePhotoUpload('before', url)}
                        />
                    </HStack>
                </Box>

                {/* Action Buttons */}
                {booking.status === 'confirmed' && (
                    <Button
                        size="xl"
                        action="primary"
                        variant="solid"
                        onPress={() => handleStatusUpdate('start')}
                        bg="$primary500"
                        mb="$6"
                    >
                        <ButtonText fontWeight="bold">Start Job</ButtonText>
                    </Button>
                )}

                {/* After Photos - If started or completed */}
                {['in_progress', 'completed'].includes(booking.status) && (
                    <Box mb="$6">
                        <Heading size="md" color="$textLight" mb="$3">After Photos</Heading>
                        <HStack flexWrap="wrap" space="sm" style={{ gap: 10 }}>
                            {afterPhotos.map((url, index) => (
                                <ImageUpload key={`after-${index}`} initialImage={url} label="After" />
                            ))}
                            <ImageUpload
                                label="Add After Photo"
                                onImageUploaded={(url) => handlePhotoUpload('after', url)}
                            />
                        </HStack>
                    </Box>
                )}

                {booking.status === 'in_progress' && (
                    <Button
                        size="xl"
                        action="success"
                        variant="solid"
                        onPress={() => handleStatusUpdate('complete')}
                        bg="$green500"
                        mb="$6"
                    >
                        <ButtonText fontWeight="bold">Complete Job</ButtonText>
                    </Button>
                )}
            </ScrollView>
        </Box>
    );
};

export default JobExecutionScreen;
