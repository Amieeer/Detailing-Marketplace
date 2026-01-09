import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, Alert, Platform, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Pressable,
    Spinner,
    Center
} from '@gluestack-ui/themed';
import api from '../services/api';
import locationService from '../services/locationService';
import BookingCard from '../components/BookingCard';
import CustomerReviewModal from '../components/CustomerReviewModal';

const TABS = [
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'in_progress', label: 'Active' },
    { id: 'completed', label: 'Done' },
    { id: 'all', label: 'All' },
];

const ManageBookingItem = React.memo(({ item, index, currentLocation, onAccept, onDecline, onStart, onComplete, onPress }) => {
    // Calculate distance if we have current location and booking location
    let distance = null;
    if (currentLocation && item.location_latitude && item.location_longitude) {
        const dist = locationService.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            parseFloat(item.location_latitude),
            parseFloat(item.location_longitude)
        );
        distance = locationService.formatDistance(dist);
    }

    // Create a new object with distance property to pass to BookingCard
    const bookingWithDistance = {
        ...item,
        distance: distance
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <BookingCard
                booking={bookingWithDistance}
                onAccept={onAccept}
                onDecline={onDecline}
                onStart={onStart}
                onComplete={onComplete}
                onPress={onPress}
            />
        </Animated.View>
    );
});

const ManageBookingsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);

    // Get current location on mount
    useEffect(() => {
        const getLocation = async () => {
            const location = await locationService.getCurrentLocation();
            if (location) {
                setCurrentLocation(location);
            }
        };
        getLocation();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'all'
                ? '/bookings/detailer'
                : `/bookings/detailer?status=${activeTab}`;

            const res = await api.get(endpoint);
            setBookings(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [activeTab])
    );

    const handleAction = async (id, action, payload = {}) => {
        try {
            await api.patch(`/bookings/${id}/${action}`, payload);
            fetchBookings(); // Refresh list
            Alert.alert('Success', `Booking ${action}ed successfully`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Action failed');
        }
    };

    const onAccept = (id) => handleAction(id, 'accept');

    const onDecline = (id) => {
        Alert.alert(
            'Decline Booking',
            'Are you sure you want to decline this booking?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: () => handleAction(id, 'decline', { reason: 'Declined by detailer' })
                }
            ]
        );
    };

    const onStart = (id) => handleAction(id, 'start');

    const executeComplete = async (id) => {
        try {
            console.log('Completing booking:', id);
            await api.patch(`/bookings/${id}/complete`, { notes: '' });

            Alert.alert('Success', 'Job completed successfully!');

            // Find the completed booking to show review modal
            const completedBooking = bookings.find(b => b.id === id);
            console.log('Found booking for review:', completedBooking);

            if (completedBooking) {
                setSelectedBooking(completedBooking);
                setReviewModalVisible(true);
            }

            fetchBookings(); // Refresh list
        } catch (error) {
            console.error('Error completing job:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to complete job');
        }
    };

    const onComplete = (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to mark this job as completed?')) {
                executeComplete(id);
            }
        } else {
            Alert.alert(
                'Complete Job',
                'Are you sure you want to mark this job as completed?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Complete',
                        onPress: () => executeComplete(id)
                    }
                ]
            );
        }
    };

    const handleSubmitCustomerReview = async (reviewData) => {
        try {
            await api.post('/customer-reviews', {
                booking_id: selectedBooking.id,
                ...reviewData
            });
            Alert.alert('Success', 'Customer review submitted!');
            setReviewModalVisible(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error('Error submitting customer review:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
        }
    };

    const renderBookingItem = ({ item, index }) => (
        <ManageBookingItem
            item={item}
            index={index}
            currentLocation={currentLocation}
            onAccept={onAccept}
            onDecline={onDecline}
            onStart={onStart}
            onComplete={onComplete}
            onPress={() => {
                if (['confirmed', 'in_progress'].includes(item.status)) {
                    navigation.navigate('JobExecution', { bookingId: item.id });
                }
            }}
        />
    );

    return (
        <Box flex={1} bg="$backgroundDark">
            <Box p="$5" pb="$2">
                <Heading size="xl" color="$textLight">Manage Bookings</Heading>
            </Box>

            {/* Tabs */}
            <Box py="$2">
                <FlatList
                    horizontal
                    data={TABS}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => setActiveTab(item.id)}
                            mr="$3"
                        >
                            <Box
                                px="$4"
                                py="$1.5"
                                rounded="$full"
                                borderWidth={1}
                                borderColor={activeTab === item.id ? "$primary500" : "$secondary800"}
                                bg={activeTab === item.id ? "$primary500" : "transparent"}
                            >
                                <Text
                                    color={activeTab === item.id ? "$black" : "$textDim"}
                                    fontWeight="bold"
                                    size="sm"
                                >
                                    {item.label}
                                </Text>
                            </Box>
                        </Pressable>
                    )}
                />
            </Box>

            {/* Bookings List */}
            {loading ? (
                <Center flex={1}>
                    <Spinner size="large" color="$primary500" />
                </Center>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderBookingItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <Center py="$10">
                            <Text color="$textDim">No bookings found in this category.</Text>
                        </Center>
                    }
                />
            )}
            <CustomerReviewModal
                visible={reviewModalVisible}
                onClose={() => {
                    setReviewModalVisible(false);
                    setSelectedBooking(null);
                }}
                onSubmit={handleSubmitCustomerReview}
                booking={selectedBooking}
            />
        </Box>
    );
};

export default ManageBookingsScreen;
