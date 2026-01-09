// Detailer Dashboard Screen
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { RefreshControl, Animated, Alert, Pressable, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Spinner,
    Center,
    Icon
} from '@gluestack-ui/themed';
import {
    BarChart3Icon,
    StarIcon,
    DollarSignIcon,
    CheckCircleIcon,
    CalendarIcon,
    WrenchIcon,
    UserIcon,
    LogOutIcon,
    MessageSquareIcon,
    WalletIcon,
    ChevronRightIcon
} from 'lucide-react-native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ActionButton from '../components/ActionButton';
import BookingCard from '../components/BookingCard';

import NextJobCard from '../components/NextJobCard';
import WeatherWidget from '../components/WeatherWidget';
import EarningsChart from '../components/EarningsChart';

const DetailerDashboardScreen = () => {
    const navigation = useNavigation();
    const { logout, user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                api.get('/detailer/stats'),
                api.get('/bookings/detailer?status=pending')
            ]);
            setStats(statsRes.data);
            setRecentBookings(bookingsRes.data.slice(0, 3));

            // Start animation after data load
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            if (!error.isSilent) {
                console.error('Error fetching dashboard data:', error);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <Spinner size="large" color="$primary500" />
            </Center>
        );
    }

    return (
        <Box flex={1} bg="$backgroundDark">
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
                }
            >
                <Box px="$5" py="$6" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <VStack>
                        <Heading size="2xl" color="$textLight">Dashboard</Heading>
                        <Text color="$textDim">Hi, {user?.email?.split('@')[0] || 'Detailer'}</Text>
                    </VStack>
                    <HStack space="md" alignItems="center">
                        <WeatherWidget />
                        <Pressable
                            onPress={() => navigation.navigate('ChatList')}
                            p="$2"
                        >
                            <Icon as={MessageSquareIcon} size="xl" color="$primary500" />
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                if (Platform.OS === 'web') {
                                    if (window.confirm('Are you sure you want to logout?')) {
                                        logout();
                                    }
                                } else {
                                    Alert.alert(
                                        'Logout',
                                        'Are you sure you want to logout?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Logout', style: 'destructive', onPress: logout }
                                        ]
                                    );
                                }
                            }}
                            p="$2"
                        >
                            <Icon as={LogOutIcon} size="xl" color="$red500" />
                        </Pressable>
                    </HStack>
                </Box>

                <Animated.View style={{ opacity: fadeAnim }}>
                    <Box px="$4" mb="$4">
                        <NextJobCard booking={stats?.nextBooking} />
                    </Box>

                    <Box px="$4" mb="$2">
                        <EarningsChart data={stats?.earningsHistory} />
                    </Box>

                    {/* Payouts / Wallet */}
                    <Box px="$4" mb="$4">
                        <Pressable onPress={() => navigation.navigate('StripeOnboarding')}>
                            <Box
                                bg="$backgroundCard"
                                p="$4"
                                rounded="$xl"
                                borderWidth={1}
                                borderColor="$secondary900"
                            >
                                <HStack space="md" alignItems="center">
                                    <Box bg="$secondary900" p="$3" rounded="$full">
                                        <Icon as={WalletIcon} size="lg" color="$primary500" />
                                    </Box>
                                    <VStack flex={1}>
                                        <Heading size="md" color="$textLight">Payouts & Wallet</Heading>
                                        <Text color="$textDim" size="sm">Manage your earnings and bank account</Text>
                                    </VStack>
                                    <Icon as={ChevronRightIcon} color="$textDim" />
                                </HStack>
                            </Box>
                        </Pressable>
                    </Box>

                    {/* Stats Grid */}
                    <VStack px="$4" space="md" mb="$6">
                        <HStack space="md" justifyContent="space-between">
                            <StatCard
                                icon={<Icon as={BarChart3Icon} size="xl" color="$primary500" />}
                                value={stats?.bookings?.total || 0}
                                label="Total Bookings"
                            />
                            <StatCard
                                icon={<Icon as={StarIcon} size="xl" color="#FFD700" fill="#FFD700" />}
                                value={stats?.rating ? parseFloat(stats.rating).toFixed(1) : 'N/A'}
                                label="Rating"
                                color="#FFD700"
                            />
                        </HStack>
                    </VStack>

                    {/* Quick Actions */}
                    <Box px="$5" py="$2">
                        <Heading size="md" color="$textLight" mb="$4">Quick Actions</Heading>
                        <VStack space="md">
                            <ActionButton
                                icon={<Icon as={CalendarIcon} size="md" color="$textLight" />}
                                title="Manage Bookings"
                                subtitle={`${stats?.bookings?.pending || 0} pending requests`}
                                badge={stats?.bookings?.pending}
                                onPress={() => navigation.navigate('ManageBookings')}
                            />
                            <ActionButton
                                icon={<Icon as={WrenchIcon} size="md" color="$textLight" />}
                                title="Manage Services"
                                subtitle={`${stats?.services?.active || 0} active services`}
                                onPress={() => navigation.navigate('ManageServices')}
                            />
                            <ActionButton
                                icon={<Icon as={UserIcon} size="md" color="$textLight" />}
                                title="Edit Profile"
                                subtitle="Update business info"
                                onPress={() => navigation.navigate('EditProfile')}
                            />
                        </VStack>
                    </Box>

                    {/* Recent Pending Bookings */}
                    <Box px="$5" pb="$10" mt="$4">
                        <Heading size="md" color="$textLight" mb="$4">Recent Requests</Heading>
                        {recentBookings.length > 0 ? (
                            <VStack space="md">
                                {recentBookings.map((booking, index) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onPress={() => navigation.navigate('ManageBookings')}
                                        onAccept={() => navigation.navigate('ManageBookings')}
                                        onDecline={() => navigation.navigate('ManageBookings')}
                                    />
                                ))}
                            </VStack>
                        ) : (
                            <Text color="$textDim" fontStyle="italic">No pending requests</Text>
                        )}
                    </Box>
                </Animated.View>
            </ScrollView>
        </Box>
    );
};

export default DetailerDashboardScreen;
