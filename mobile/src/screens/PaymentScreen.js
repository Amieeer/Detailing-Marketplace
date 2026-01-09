import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Button,
    ButtonText,
    ButtonSpinner,
    Divider,
    Center
} from '@gluestack-ui/themed';
import { useStripe } from '../hooks/useStripeWrapper';
import api from '../services/api';
import { parseDateTimeToIso } from '../utils/dateTimeParser';

const PaymentScreen = ({ route, navigation }) => {
    const { service, detailerId, date, time, locationAddress, vehicle } = route.params;
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initializePaymentSheet();
    }, []);

    const initializePaymentSheet = async () => {
        setLoading(true);
        try {
            // Step A: Create Booking
            const bookingPayload = {
                detailer_id: detailerId,
                service_id: service.id,
                vehicle_id: vehicle ? vehicle.id : null // Add vehicle_id if available
            };

            // Fix: Convert "YYYY-MM-DD" and "HH:MM AM/PM" to ISO String using robust parser
            const isoTime = parseDateTimeToIso(date, time);

            if (isoTime) {
                bookingPayload.scheduled_time = isoTime;
            } else {
                console.error('Invalid date format:', date, time);
                Alert.alert('Error', 'Invalid date/time format');
                setLoading(false);
                return;
            }

            if (route.params.locationCoordinates) {
                bookingPayload.location_latitude = route.params.locationCoordinates.latitude;
                bookingPayload.location_longitude = route.params.locationCoordinates.longitude;
            }

            const bookingRes = await api.post('/bookings', bookingPayload);
            const bookingId = bookingRes.data.id;

            // Step B: Create Payment Intent
            const response = await api.post('/payments/create-intent', {
                bookingId: bookingId,
            });

            const { clientSecret } = response.data;

            // Step C: Init Stripe Sheet
            const { error } = await initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'Midnight Detail',
                appearance: {
                    colors: {
                        primary: '#00e5ff',
                        background: '#1e1e1e',
                        componentBackground: '#333333',
                        componentBorder: '#555555',
                        componentDivider: '#555555',
                        primaryText: '#ffffff',
                        secondaryText: '#b0bec5',
                        placeholderText: '#666666',
                    },
                },
            });

            if (error) {
                console.error('Stripe Init Error:', error);
                Alert.alert('Payment Error', `Could not initialize payment: ${error.message}`);
                setLoading(false);
                return;
            } else {
                setReady(true);
            }
        } catch (error) {
            console.error('Payment Initialization Error:', error);
            const message = error.response?.data?.message || error.message || 'Could not initialize payment';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert('Payment failed', error.message);
        } else {
            Alert.alert('Success', 'Your booking is confirmed!', [
                {
                    text: 'View Bookings',
                    onPress: () => navigation.navigate('MyBookings')
                }
            ]);
        }
    };

    return (
        <Box flex={1} bg="$backgroundDark" p="$5">
            <Heading size="2xl" color="$textLight" mb="$8">Checkout</Heading>

            <Box
                bg="$backgroundCard"
                p="$5"
                rounded="$xl"
                borderWidth={1}
                borderColor="$secondary900"
                mb="$8"
            >
                <Heading size="md" color="$primary500" mb="$4">Order Summary</Heading>

                <VStack space="sm">
                    <HStack justifyContent="space-between">
                        <Text color="$textDim">Service</Text>
                        <Text color="$textLight" fontWeight="bold">{service.name}</Text>
                    </HStack>
                    {vehicle && (
                        <HStack justifyContent="space-between">
                            <Text color="$textDim">Vehicle</Text>
                            <Text color="$textLight" fontWeight="bold">{vehicle.make} {vehicle.model}</Text>
                        </HStack>
                    )}
                    <HStack justifyContent="space-between">
                        <Text color="$textDim">Date</Text>
                        <Text color="$textLight" fontWeight="bold">{date}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                        <Text color="$textDim">Time</Text>
                        <Text color="$textLight" fontWeight="bold">{time}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                        <Text color="$textDim">Location</Text>
                        <Text color="$textLight" fontWeight="bold" flex={1} textAlign="right" numberOfLines={2}>{locationAddress}</Text>
                    </HStack>
                </VStack>

                <Divider bg="$secondary800" my="$4" />

                <HStack justifyContent="space-between">
                    <Text color="$textLight" size="lg" fontWeight="bold">Total</Text>
                    <Text color="$primary500" size="2xl" fontWeight="bold">${service.price}</Text>
                </HStack>
            </Box>

            <Button
                size="xl"
                action="primary"
                variant="solid"
                onPress={openPaymentSheet}
                isDisabled={!ready || loading}
                bg="$primary500"
                rounded="$full"
            >
                {loading ? (
                    <ButtonSpinner color="$white" />
                ) : (
                    <ButtonText fontWeight="bold">Pay Now</ButtonText>
                )}
            </Button>
        </Box>
    );
};

export default PaymentScreen;
