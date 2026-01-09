import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, RefreshControl, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Badge,
    BadgeText,
    Spinner,
    Center,
    Button,
    ButtonText,
    Icon,
    Divider
} from '@gluestack-ui/themed';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    BuildingIcon,
    ClipboardListIcon,
    CheckIcon
} from 'lucide-react-native';
import api from '../services/api';
import ReviewModal from '../components/ReviewModal';

const BookingItem = React.memo(({ item, index, getStatusColor, handleWriteReview }) => {
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
            <Box
                bg="$backgroundCard"
                p="$4"
                mb="$4"
                rounded="$xl"
                borderWidth={1}
                borderColor="$secondary900"
                hardShadow="2"
            >
                <HStack justifyContent="space-between" alignItems="flex-start" mb="$3">
                    <Heading size="md" color="$textLight" flex={1} mr="$2">{item.service_name}</Heading>
                    <Badge action={getStatusColor(item.status)} variant="solid" borderRadius="$sm">
                        <BadgeText textTransform="uppercase" fontWeight="bold" size="xs">
                            {item.status.replace('_', ' ')}
                        </BadgeText>
                    </Badge>
                </HStack>

                <VStack space="sm" mb="$4">
                    <HStack space="xs" alignItems="center">
                        <Icon as={BuildingIcon} size="sm" color="$textDim" />
                        <Text color="$textDim" size="sm">{item.detailer_name || 'Detailer'}</Text>
                    </HStack>
                    <HStack space="xs" alignItems="center">
                        <Icon as={CalendarIcon} size="sm" color="$textDim" />
                        <Text color="$textDim" size="sm">
                            {new Date(item.scheduled_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </HStack>
                    <HStack space="xs" alignItems="center">
                        <Icon as={ClockIcon} size="sm" color="$textDim" />
                        <Text color="$textDim" size="sm">
                            {new Date(item.scheduled_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                    </HStack>
                    <HStack space="xs" alignItems="center">
                        <Icon as={MapPinIcon} size="sm" color="$textDim" />
                        <Text color="$textDim" size="sm" numberOfLines={1} flex={1}>
                            {item.location_address || 'Address not provided'}
                        </Text>
                    </HStack>
                </VStack>

                <Divider bg="$secondary900" mb="$3" />

                <HStack justifyContent="space-between" alignItems="center">
                    <VStack>
                        <Text color="$primary500" size="xl" fontWeight="bold">${parseFloat(item.total_price).toFixed(2)}</Text>
                        <Text color="$textDim" size="xs">Booked {new Date(item.created_at).toLocaleDateString()}</Text>
                    </VStack>

                    {item.status === 'completed' && !item.has_review && (
                        <Button size="sm" action="primary" variant="outline" onPress={() => handleWriteReview(item)} borderColor="$primary500">
                            <ButtonText color="$primary500" fontWeight="bold">Write Review</ButtonText>
                        </Button>
                    )}

                    {item.status === 'completed' && item.has_review && (
                        <HStack space="xs" alignItems="center" bg="$success900" px="$2" py="$1" rounded="$md">
                            <Icon as={CheckIcon} size="xs" color="$success400" />
                            <Text color="$success400" size="xs" fontWeight="bold">Reviewed</Text>
                        </HStack>
                    )}
                </HStack>
            </Box>
        </Animated.View>
    );
});

const MyBookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleWriteReview = (booking) => {
        setSelectedBooking(booking);
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await api.post('/reviews', {
                booking_id: selectedBooking.id,
                ...reviewData
            });
            setReviewModalVisible(false);
            setSelectedBooking(null);
            fetchBookings(); // Refresh to show updated booking with review
        } catch (error) {
            console.error('Error submitting review:', error);
            // Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'confirmed': return 'info';
            case 'in_progress': return 'primary';
            case 'completed': return 'success';
            case 'cancelled':
            case 'declined': return 'error';
            default: return 'muted';
        }
    };

    const renderBooking = ({ item, index }) => (
        <BookingItem
            item={item}
            index={index}
            getStatusColor={getStatusColor}
            handleWriteReview={handleWriteReview}
        />
    );

    if (loading) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <Spinner size="large" color="$primary500" />
            </Center>
        );
    }

    return (
        <Box flex={1} bg="$backgroundDark">
            <FlatList
                data={bookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
                }
                ListEmptyComponent={
                    <Center py="$10">
                        <Icon as={ClipboardListIcon} size={64} color="$secondary800" mb="$4" />
                        <Heading size="lg" color="$textLight" mb="$2">No Bookings Yet</Heading>
                        <Text color="$textDim" textAlign="center" mb="$6">
                            Your booking history will appear here once you book a service.
                        </Text>
                        <Button action="primary" variant="solid" onPress={() => navigation.navigate('Home')} bg="$primary500">
                            <ButtonText fontWeight="bold">Browse Detailers</ButtonText>
                        </Button>
                    </Center>
                }
            />
            <ReviewModal
                visible={reviewModalVisible}
                onClose={() => {
                    setReviewModalVisible(false);
                    setSelectedBooking(null);
                }}
                onSubmit={handleSubmitReview}
            />
        </Box>
    );
};

export default MyBookingsScreen;
