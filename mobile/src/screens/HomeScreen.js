import React, { useState, useEffect, useContext } from 'react';
import { FlatList, RefreshControl, StatusBar, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Pressable,
    Icon,
    Divider,
    Center,
    Button,
    ButtonText,
    ButtonIcon,
    Image
} from '@gluestack-ui/themed';
import {
    ChevronRightIcon,
    ClipboardListIcon,
    UserIcon,
    CarIcon,
    MapPinIcon,
    ListIcon,
    MapIcon,
    LogOutIcon,
    MessageSquareIcon
} from 'lucide-react-native';
import { Animated } from 'react-native';
import api from '../services/api';
import locationService from '../services/locationService';
import favoriteService from '../services/favoriteService';
import DetailerCard from '../components/DetailerCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { AuthContext } from '../context/AuthContext';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from '../components/Maps';
import { midnightMapStyle } from '../constants/mapStyle';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DetailerItem = React.memo(({ item, index, isFavorite, onToggleFavorite, onPress }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <DetailerCard
                detailer={item}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                onPress={onPress}
            />
        </Animated.View>
    );
});

const HomeScreen = ({ navigation }) => {
    const [detailers, setDetailers] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const { user, logout } = useContext(AuthContext);
    const scrollY = React.useRef(new Animated.Value(0)).current;

    // Maps only available on native
    const MAPS_ENABLED = Platform.OS !== 'web';

    const fetchDetailers = async () => {
        try {
            let location = userLocation;
            if (!location) {
                location = await locationService.getCurrentLocation();
                if (location) {
                    setUserLocation(location);
                }
            }

            const params = location ? {
                latitude: location.latitude,
                longitude: location.longitude,
                radius: 50 // Default radius
            } : {};

            const response = await api.get('/users/detailers', { params });
            setDetailers(response.data);

            // Fetch favorites
            const favs = await favoriteService.getFavorites();
            const favSet = new Set(favs.map(f => f.id));
            setFavorites(favSet);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        requestLocationAndFetch();
    }, []);

    const requestLocationAndFetch = async () => {
        try {
            const hasPermission = await locationService.checkPermissions();
            if (!hasPermission) {
                const permissionPromise = locationService.requestPermissions();
                const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 5000));
                const granted = await Promise.race([permissionPromise, timeoutPromise]);
                if (!granted) console.log('Location permission denied or timed out');
            }
        } catch (error) {
            console.error('Error requesting location:', error);
        } finally {
            fetchDetailers();
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDetailers();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const toggleFavorite = async (detailerId) => {
        // Optimistic Update
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(detailerId)) {
                newSet.delete(detailerId);
            } else {
                newSet.add(detailerId);
            }
            return newSet;
        });

        try {
            const result = await favoriteService.toggleFavorite(detailerId);
            setFavorites(prev => {
                const newSet = new Set(prev);
                if (result.isFavorite) {
                    newSet.add(detailerId);
                } else {
                    newSet.delete(detailerId);
                }
                return newSet;
            });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setFavorites(prev => {
                const newSet = new Set(prev);
                if (newSet.has(detailerId)) {
                    newSet.delete(detailerId);
                } else {
                    newSet.add(detailerId);
                }
                return newSet;
            });
            Alert.alert('Error', 'Failed to update favorite status');
        }
    };

    const renderItem = ({ item, index }) => (
        <DetailerItem
            item={item}
            index={index}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate('DetailerProfile', { detailerId: item.id })}
        />
    );

    if (loading) {
        return <LoadingState message="Finding detailers near you..." />;
    }

    return (
        <Box flex={1} bg="$backgroundDark">
            <StatusBar barStyle="light-content" />

            {/* Hero Section */}
            <Box bg="$backgroundCard" pt="$12" pb="$6" px="$5" borderBottomWidth={1} borderColor="$backgroundDark">
                <HStack justifyContent="space-between" alignItems="flex-start">
                    <VStack space="xs">
                        <Text color="$textDim" size="sm" fontWeight="$medium">{getGreeting()},</Text>
                        <Heading color="$textLight" size="2xl">{user?.email?.split('@')[0] || 'User'} 👋</Heading>
                        <Text color="$textDim" size="md">Find your perfect car detailer</Text>
                    </VStack>

                    <HStack space="sm">
                        {/* Logout Button */}
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
                            bg="$secondary900"
                            p="$2"
                            rounded="$full"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Icon as={LogOutIcon} size="sm" color="$red500" />
                        </Pressable>
                    </HStack>
                </HStack>
            </Box>

            {viewMode === 'list' || !MAPS_ENABLED ? (
                <>
                    {/* Quick Access */}
                    <Box px="$5" py="$4">
                        <HStack space="sm">
                            {/* ... keep existing buttons ... */}
                            <Box flex={1}>
                                <Animated.View style={{ flex: 1 }}>
                                    <Pressable onPress={() => navigation.navigate('MyBookings')} style={{ flex: 1 }}>
                                        {({ pressed }) => (
                                            <Box
                                                bg={pressed ? "$secondary900" : "$backgroundCard"}
                                                p="$5"
                                                rounded="$lg"
                                                borderWidth={2}
                                                borderColor="$secondary900"
                                                flex={1}
                                                height={100}
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Box bg="$secondary900" p="$2" rounded="$full" mb="$0.7">
                                                    <Icon as={ClipboardListIcon} size="sm" color="$primary500" />
                                                </Box>
                                                <Heading size="xs" color="$textLight" textAlign="center">Bookings</Heading>
                                            </Box>
                                        )}
                                    </Pressable>
                                </Animated.View>
                            </Box>

                            <Box flex={1}>
                                <Animated.View style={{ flex: 1 }}>
                                    <Pressable onPress={() => navigation.navigate('VehicleList')} style={{ flex: 1 }}>
                                        {({ pressed }) => (
                                            <Box
                                                bg={pressed ? "$secondary900" : "$backgroundCard"}
                                                p="$5"
                                                rounded="$lg"
                                                borderWidth={2}
                                                borderColor="$secondary900"
                                                flex={1}
                                                height={100}
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Box bg="$secondary900" p="$2" rounded="$full" mb="$0.7">
                                                    <Icon as={CarIcon} size="sm" color="$primary500" />
                                                </Box>
                                                <Heading size="xs" color="$textLight" textAlign="center">Garage</Heading>
                                            </Box>
                                        )}
                                    </Pressable>
                                </Animated.View>
                            </Box>

                            <Box flex={1}>
                                <Animated.View style={{ flex: 1 }}>
                                    <Pressable onPress={() => navigation.navigate('EditProfile')} style={{ flex: 1 }}>
                                        {({ pressed }) => (
                                            <Box
                                                bg={pressed ? "$secondary900" : "$backgroundCard"}
                                                p="$5"
                                                rounded="$lg"
                                                borderWidth={2}
                                                borderColor="$secondary900"
                                                flex={1}
                                                height={100}
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Box bg="$secondary900" p="$2" rounded="$full" mb="$0.7">
                                                    <Icon as={UserIcon} size="sm" color="$primary500" />
                                                </Box>
                                                <Heading size="xs" color="$textLight" textAlign="center">Profile</Heading>
                                            </Box>
                                        )}
                                    </Pressable>
                                </Animated.View>
                            </Box>
                        </HStack>
                    </Box>

                    {/* List */}
                    <Box px="$5" mb="$4" mt="$6">
                        <HStack justifyContent="space-between" alignItems="flex-end">
                            <VStack>
                                <Heading size="xl" color="$textLight">Top Detailers</Heading>
                                <Text size="sm" color="$textDim">Hand-picked professionals near you</Text>
                            </VStack>
                            <Pressable onPress={onRefresh}>
                                <Text color="$primary500" fontWeight="$bold" size="sm">See All</Text>
                            </Pressable>
                        </HStack>
                    </Box>

                    {
                        detailers.length > 0 ? (
                            <Animated.FlatList
                                data={detailers}
                                renderItem={renderItem}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
                                }
                                showsVerticalScrollIndicator={false}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                                scrollEventThrottle={16}
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon as={CarIcon} size="xl" color="$textDim" />}
                                title="No detailers found"
                                message="We couldn't find any detailers in your area. Try refreshing or check back later."
                                actionText="Refresh"
                                onAction={onRefresh}
                            />
                        )
                    }
                </>
            ) : (
                <Box flex={1}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={{ flex: 1 }}
                        customMapStyle={midnightMapStyle}
                        initialRegion={{
                            latitude: userLocation?.latitude || 42.3601,
                            longitude: userLocation?.longitude || -71.0589,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        }}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                    >
                        {detailers.map(detailer => (
                            detailer.latitude && detailer.longitude ? (
                                <Marker
                                    key={detailer.id}
                                    coordinate={{
                                        latitude: parseFloat(detailer.latitude),
                                        longitude: parseFloat(detailer.longitude),
                                    }}
                                >
                                    <Box
                                        bg="$backgroundCard"
                                        p="$1"
                                        rounded="$full"
                                        borderWidth={2}
                                        borderColor="$primary500"
                                        shadowColor="$black"
                                        shadowOffset={{ width: 0, height: 2 }}
                                        shadowOpacity={0.3}
                                        shadowRadius={2}
                                    >
                                        {detailer.profile_picture_url ? (
                                            <Box
                                                width={40}
                                                height={40}
                                                rounded="$full"
                                                overflow="hidden"
                                                bg="$secondary800"
                                            >
                                                <Image
                                                    source={{ uri: detailer.profile_picture_url }}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="cover"
                                                />
                                            </Box>
                                        ) : (
                                            <Box
                                                width={40}
                                                height={40}
                                                rounded="$full"
                                                bg="$secondary800"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Icon as={UserIcon} size="md" color="$textDim" />
                                            </Box>
                                        )}

                                        {/* Rating Badge */}
                                        <Box
                                            position="absolute"
                                            bottom={-5}
                                            right={-5}
                                            bg="$primary500"
                                            px="$1.5"
                                            py="$0.5"
                                            rounded="$full"
                                        >
                                            <Text color="$white" size="2xs" fontWeight="bold">
                                                {detailer.rating || 'N/A'}
                                            </Text>
                                        </Box>
                                    </Box>

                                    <Callout tooltip onPress={() => navigation.navigate('DetailerProfile', { detailerId: detailer.id })}>
                                        <Box bg="$backgroundCard" p="$3" rounded="$lg" borderWidth={1} borderColor="$secondary900" width={200}>
                                            <Heading size="sm" color="$textLight" mb="$1">{detailer.business_name}</Heading>
                                            <Text size="xs" color="$textDim" mb="$2">{detailer.rating} ★ ({detailer.jobs_completed} jobs)</Text>
                                            <Button size="xs" action="primary" bg="$primary500">
                                                <ButtonText>View Profile</ButtonText>
                                            </Button>
                                        </Box>
                                    </Callout>
                                </Marker>
                            ) : null
                        ))}
                    </MapView>
                </Box>
            )}

            {/* Sticky Action Footer */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#1E1E1E', // Charcoal
                    borderTopWidth: 1,
                    borderTopColor: '#333',
                    padding: 16,
                    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transform: [{
                        translateY: viewMode === 'list' ? scrollY.interpolate({
                            inputRange: [50, 150],
                            outputRange: [100, 0],
                            extrapolate: 'clamp'
                        }) : 0 // Always show in map mode if desired, or toggle logic
                    }],
                    zIndex: 100,
                }}
            >
                {/* View Toggle */}
                {MAPS_ENABLED && (
                    <Box bg="$backgroundDark" rounded="$full" p="$1" flexDirection="row" borderWidth={1} borderColor="$primary500">
                        <Pressable
                            onPress={() => setViewMode('list')}
                            bg={viewMode === 'list' ? "$primary500" : "transparent"}
                            p="$2"
                            rounded="$full"
                        >
                            <Icon as={ListIcon} color={viewMode === 'list' ? "$backgroundDark" : "$textLight"} size="sm" />
                        </Pressable>
                        <Pressable
                            onPress={() => setViewMode('map')}
                            bg={viewMode === 'map' ? "$primary500" : "transparent"}
                            p="$2"
                            rounded="$full"
                        >
                            <Icon as={MapIcon} color={viewMode === 'map' ? "$backgroundDark" : "$textLight"} size="sm" />
                        </Pressable>
                    </Box>
                )}

                {/* Message Button (Full Width if Map disabled, or side-by-side) */}
                <Button
                    action="secondary"
                    variant="solid"
                    bg="$secondary800"
                    rounded="$full"
                    onPress={() => navigation.navigate('ChatList')}
                    flex={1}
                    ml={MAPS_ENABLED ? "$4" : 0}
                >
                    <ButtonIcon as={MessageSquareIcon} mr="$2" color="$white" />
                    <ButtonText fontWeight="$bold" color="$white">Messages</ButtonText>
                </Button>
            </Animated.View>
        </Box>
    );
};

export default HomeScreen;
