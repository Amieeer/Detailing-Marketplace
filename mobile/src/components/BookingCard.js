import React, { useRef } from 'react';
import {
    Box,
    Text,
    Pressable,
    HStack,
    VStack,
    Badge,
    BadgeText,
    Button,
    ButtonText
} from '@gluestack-ui/themed';
import { Animated } from 'react-native';

const BookingCard = ({ booking, onAccept, onDecline, onStart, onComplete, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'confirmed': return 'info';
            case 'in_progress': return 'primary';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'muted';
        }
    };

    const statusAction = getStatusColor(booking.status);

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
                style={{
                    transform: [{ scale }],
                }}
            >
                <Box
                    bg="$backgroundCard"
                    p="$4"
                    mb="$4"
                    rounded="$xl"
                    borderWidth={1}
                    borderColor="$secondary900"
                    hardShadow="2"
                >
                    <HStack justifyContent="space-between" alignItems="center" mb="$3">
                        <Text color="$textLight" fontWeight="$bold" size="lg" flex={1}>
                            {booking.service_name}
                        </Text>
                        <Badge action={statusAction} variant="solid" borderRadius="$sm">
                            <BadgeText textTransform="uppercase" fontWeight="$bold" size="xs">
                                {booking.status.replace('_', ' ')}
                            </BadgeText>
                        </Badge>
                    </HStack>

                    <VStack space="xs" mb="$4">
                        <Text color="$textDim" size="sm">📅 {new Date(booking.scheduled_time).toLocaleString()}</Text>
                        <Text color="$textDim" size="sm">📍 {booking.location_address}</Text>
                        {booking.distance && (
                            <Text color="$textDim" size="sm">📏 {booking.distance}</Text>
                        )}
                        <Text color="$textLight" fontWeight="$bold" size="md" mt="$1">💰 ${booking.total_price}</Text>
                        {booking.customer_email && (
                            <Text color="$textDim" size="sm">👤 {booking.customer_email}</Text>
                        )}
                    </VStack>

                    <HStack space="md" justifyContent="flex-end">
                        {booking.status === 'pending' && (
                            <>
                                <Button size="sm" action="primary" variant="solid" onPress={() => onAccept(booking.id)} bg="$primary500">
                                    <ButtonText fontWeight="$bold">Accept</ButtonText>
                                </Button>
                                <Button size="sm" action="negative" variant="outline" onPress={() => onDecline(booking.id)} borderColor="$red500">
                                    <ButtonText color="$red500" fontWeight="$bold">Decline</ButtonText>
                                </Button>
                            </>
                        )}

                        {booking.status === 'confirmed' && (
                            <Button size="sm" action="primary" variant="solid" onPress={() => onStart(booking.id)} w="$full" bg="$primary500">
                                <ButtonText fontWeight="$bold">Start Job</ButtonText>
                            </Button>
                        )}

                        {booking.status === 'in_progress' && (
                            <Button size="sm" action="success" variant="solid" onPress={() => onComplete(booking.id)} w="$full" bg="$green500">
                                <ButtonText fontWeight="$bold">Complete Job</ButtonText>
                            </Button>
                        )}
                    </HStack>
                </Box>
            </Animated.View>
        </Pressable>
    );
};

export default BookingCard;
