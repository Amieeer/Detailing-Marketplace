import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Box, Text, VStack, HStack, Icon, Button, ButtonText } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPinIcon, ClockIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NextJobCard = ({ booking }) => {
    const navigation = useNavigation();

    if (!booking) {
        return (
            <Box style={styles.container}>
                <LinearGradient
                    colors={['#1e1b4b', '#312e81']} // Deep indigo gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <VStack space="md" alignItems="center" py="$6">
                        <Icon as={CalendarIcon} size="xl" color="$white" opacity={0.5} />
                        <Text color="$white" fontWeight="bold" size="lg">No Upcoming Jobs</Text>
                        <Text color="$blue200" size="sm">You're all caught up!</Text>
                    </VStack>
                </LinearGradient>
            </Box>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <Box style={styles.container}>
            <LinearGradient
                colors={['#4f46e5', '#3730a3']} // Indigo 600 to 800
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <VStack space="md">
                    <HStack justifyContent="space-between" alignItems="center">
                        <Box bg="$white" px="$3" py="$1" rounded="$full" opacity={0.2}>
                            <Text color="$white" size="xs" fontWeight="bold">NEXT APPOINTMENT</Text>
                        </Box>
                        <Text color="$blue100" size="sm" fontWeight="bold">{formatDate(booking.scheduled_time)}</Text>
                    </HStack>

                    <VStack mt="$2">
                        <Text color="$white" size="2xl" fontWeight="bold" numberOfLines={1}>
                            {booking.service_name || 'Car Detailing'}
                        </Text>
                        <Text color="$blue100" size="md">
                            {booking.customer_name || 'Customer'} • {booking.vehicle_details || 'Vehicle'}
                        </Text>
                    </VStack>

                    <VStack space="sm" mt="$2">
                        <HStack space="sm" alignItems="center">
                            <Icon as={ClockIcon} size="sm" color="$blue200" />
                            <Text color="$white" size="sm">{formatTime(booking.scheduled_time)} ({booking.duration_minutes} min)</Text>
                        </HStack>
                        <HStack space="sm" alignItems="center">
                            <Icon as={MapPinIcon} size="sm" color="$blue200" />
                            <Text color="$white" size="sm" numberOfLines={1} style={{ flex: 1 }}>
                                {booking.location_address}
                            </Text>
                        </HStack>
                    </VStack>

                    <Button
                        size="md"
                        variant="solid"
                        action="secondary"
                        bg="$white"
                        rounded="$full"
                        mt="$4"
                        onPress={() => navigation.navigate('JobExecution', { bookingId: booking.id })}
                    >
                        <ButtonText color="$indigo600" fontWeight="bold">Start Job</ButtonText>
                        <Icon as={ChevronRightIcon} size="sm" color="$indigo600" ml="$2" />
                    </Button>
                </VStack>
            </LinearGradient>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        marginVertical: 10,
    },
    gradient: {
        padding: 20,
    },
});

export default NextJobCard;
