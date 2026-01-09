import React, { useState, useEffect, useContext, useRef } from 'react';
import { Linking, Alert, Dimensions, StyleSheet, Image, Platform, Animated } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    Button,
    ButtonText,
    ButtonIcon,
    Icon,
    Divider,
    Center,
    Spinner
} from '@gluestack-ui/themed';
import {
    PhoneIcon,
    StarIcon,
    MapPinIcon,
    ClockIcon,
    CameraIcon,
    MessageSquareIcon
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import ContactButtons from '../components/ContactButtons';
import { AuthContext } from '../context/AuthContext';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from '../components/Maps';
import { midnightMapStyle } from '../constants/mapStyle';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = 250;

const DetailerProfileScreen = ({ route, navigation }) => {
    const { detailerId } = route.params;
    const { user } = useContext(AuthContext);
    const [detailer, setDetailer] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HERO_HEIGHT - 100],
        outputRange: [HERO_HEIGHT, 100],
        extrapolate: 'clamp'
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HERO_HEIGHT - 100],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const imageScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.5, 1],
        extrapolate: 'clamp'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailerRes, servicesRes, reviewsRes] = await Promise.all([
                    api.get(`/users/detailers/${detailerId}`),
                    api.get(`/services/detailer/${detailerId}`),
                    api.get(`/reviews/detailer/${detailerId}`)
                ]);
                setDetailer(detailerRes.data);
                setServices(servicesRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Could not load detailer profile');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [detailerId, user]);

    const handleCallPress = () => {
        if (detailer?.phone_number) {
            Linking.openURL(`tel:${detailer.phone_number}`);
        } else {
            Alert.alert('No Phone', 'This detailer has not provided a phone number');
        }
    };

    if (loading) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <Spinner size="large" color="$primary500" />
            </Center>
        );
    }

    if (!detailer) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <Text color="$textDim">Detailer not found</Text>
            </Center>
        );
    }

    // Coordinates for map
    const latitude = parseFloat(detailer.latitude || 0);
    const longitude = parseFloat(detailer.longitude || 0);
    const hasLocation = latitude !== 0 && longitude !== 0;
    const radiusMeters = (detailer.service_radius_km || 20) * 1000;

    return (
        <Box flex={1} bg="$backgroundDark">
            <Animated.View style={[styles.heroContainer, { height: headerHeight }]}>
                <Box flex={1} bg="$primary900" position="relative">
                    {detailer.cover_image ? (
                        <Animated.Image
                            source={{ uri: detailer.cover_image }}
                            style={{ width: '100%', height: '100%', opacity: headerOpacity, transform: [{ scale: imageScale }] }}
                            resizeMode="cover"
                        />
                    ) : (
                        <>
                            <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="$black" opacity={0.4} />
                            <Center h="100%">
                                <Icon as={CameraIcon} size={64} color="$primary300" opacity={0.3} />
                            </Center>
                        </>
                    )}

                    {/* Dark overlay for text readability */}
                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="$backgroundDark" opacity={0.3} />

                    {user?.id == detailer.id && (
                        <Box position="absolute" top={40} right={20} zIndex={10}>
                            <ImageUpload
                                onImageUploaded={async (url) => {
                                    try {
                                        await api.put('/users/profile', { cover_image: url });
                                        setDetailer(prev => ({ ...prev, cover_image: url }));
                                        Alert.alert('Success', 'Cover photo updated!');
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to update cover photo');
                                    }
                                }}
                                label="Edit Cover"
                                width={100}
                                height={36}
                                borderRadius={18}
                                initialImage={null} // Don't show preview, just the button
                            />
                        </Box>
                    )}
                </Box>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: HERO_HEIGHT - 60, minHeight: height + 250 }}
            >
                {/* Profile Header Card */}
                <Box px="$5" mb="$6">
                    <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                        <Center py="$6" px="$4">
                            <Animated.View style={{
                                opacity: headerOpacity,
                                transform: [{
                                    translateY: scrollY.interpolate({
                                        inputRange: [0, HERO_HEIGHT / 2],
                                        outputRange: [0, -50],
                                        extrapolate: 'clamp'
                                    })
                                }]
                            }}>
                                <Avatar size="2xl" borderColor="$backgroundDark" borderWidth={4} bg="$primary500" mb="$3">
                                    {detailer.profile_picture_url ? (
                                        <AvatarImage source={{ uri: detailer.profile_picture_url }} alt="Profile" />
                                    ) : (
                                        <AvatarFallbackText>{detailer.business_name || 'D'}</AvatarFallbackText>
                                    )}
                                </Avatar>
                            </Animated.View>

                            {user?.id == detailer.id && (
                                <Box mt="$2">
                                    <ImageUpload
                                        onImageUploaded={async (url) => {
                                            try {
                                                await api.put('/users/profile', { profile_picture_url: url });
                                                setDetailer(prev => ({ ...prev, profile_picture_url: url }));
                                                Alert.alert('Success', 'Profile picture updated!');
                                            } catch (error) {
                                                Alert.alert('Error', 'Failed to update profile picture');
                                            }
                                        }}
                                        label="Change Photo"
                                        initialImage={detailer.profile_picture_url}
                                    />
                                </Box>
                            )}

                            <Heading size="2xl" color="$textLight" textAlign="center" mb="$2">
                                {detailer.business_name || 'Professional Detailer'}
                            </Heading>

                            <HStack space="sm" alignItems="center" mb="$6">
                                <HStack space="xs" alignItems="center" bg="$backgroundDark" borderColor="$primary500" borderWidth={1} px="$3" py="$1.5" rounded="$full">
                                    <Icon as={StarIcon} size="xs" color="$primary500" fill="$primary500" />
                                    <Text color="$textLight" fontWeight="$bold" size="sm">
                                        {detailer.rating ? parseFloat(detailer.rating).toFixed(1) : 'New'}
                                    </Text>
                                </HStack>
                                <HStack space="xs" alignItems="center" bg="$backgroundDark" px="$3" py="$1.5" rounded="$full">
                                    <Icon as={MapPinIcon} size="xs" color="$primary300" />
                                    <Text color="$textDim" size="sm">
                                        {detailer.service_radius_km || 20}km radius
                                    </Text>
                                </HStack>
                            </HStack>

                            <HStack space="xl" w="100%" justifyContent="center">
                                <VStack alignItems="center">
                                    <Text color="$textLight" fontWeight="$bold" size="2xl">{detailer.jobs_completed || 0}</Text>
                                    <Text color="$textDim" size="xs">Jobs Done</Text>
                                </VStack>
                                <Divider orientation="vertical" h="$10" bg="$secondary800" />
                                <VStack alignItems="center">
                                    <Text color="$textLight" fontWeight="$bold" size="2xl">{reviews.length}</Text>
                                    <Text color="$textDim" size="xs">Reviews</Text>
                                </VStack>
                            </HStack>
                        </Center>
                    </BlurView>
                </Box>

                {/* About Section */}
                {detailer.bio && (
                    <Box px="$5" mb="$6">
                        <Heading size="md" color="$primary500" mb="$3">About</Heading>
                        <Text color="$textDim" lineHeight="$md">{detailer.bio}</Text>
                    </Box>
                )}

                {/* Service Area Map */}
                {hasLocation && (
                    <Box px="$5" mb="$6">
                        <Heading size="md" color="$primary500" mb="$3">Service Area</Heading>
                        <Box height={200} rounded="$xl" overflow="hidden" borderWidth={1} borderColor="$secondary900">
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={{ flex: 1 }}
                                customMapStyle={midnightMapStyle}
                                initialRegion={{
                                    latitude: latitude,
                                    longitude: longitude,
                                    latitudeDelta: 0.2, // Adjust based on radius
                                    longitudeDelta: 0.2,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker coordinate={{ latitude, longitude }}>
                                    <Icon as={MapPinIcon} size="xl" color="$primary500" fill="rgba(0, 229, 255, 0.2)" />
                                </Marker>
                                <Circle
                                    center={{ latitude, longitude }}
                                    radius={radiusMeters}
                                    strokeColor="rgba(0, 229, 255, 0.5)"
                                    fillColor="rgba(0, 229, 255, 0.1)"
                                />
                            </MapView>
                        </Box>
                    </Box>
                )}

                {/* Contact Buttons */}
                {/* Contact Buttons */}
                <Box px="$5" mb="$8">
                    <ContactButtons
                        detailer={detailer}
                        user={user}
                        onCallPress={handleCallPress}
                        onMessagePress={() => navigation.navigate('Chat', {
                            recipientId: detailer.id,
                            recipientName: detailer.business_name,
                            recipientImage: detailer.profile_picture_url
                        })}
                    />
                </Box>

                {/* Services Section */}
                <Box px="$5" mb="$8">
                    <Heading size="md" color="$primary500" mb="$4">Services</Heading>

                    {services.length > 0 ? (
                        <VStack space="md">
                            {services.map((service, index) => (
                                <Box
                                    key={service.id}
                                    bg="$backgroundCard"
                                    p="$4"
                                    rounded="$xl"
                                    borderWidth={1}
                                    borderColor="$secondary900"
                                    hardShadow="1"
                                >
                                    <HStack justifyContent="space-between" alignItems="flex-start" mb="$2">
                                        <Heading size="md" color="$textLight" flex={1}>{service.name}</Heading>
                                        <Text size="xl" color="$primary400" fontWeight="$bold">${service.price}</Text>
                                    </HStack>

                                    <Text color="$textDim" size="sm" mb="$4">{service.description}</Text>

                                    <HStack justifyContent="space-between" alignItems="center">
                                        <HStack space="xs" alignItems="center">
                                            <Icon as={ClockIcon} size="sm" color="$textDim" />
                                            <Text color="$textDim" size="sm">{service.duration_minutes} mins</Text>
                                        </HStack>

                                        <Button
                                            size="sm"
                                            action="secondary"
                                            variant="outline"
                                            borderColor="$primary500"
                                            onPress={() => navigation.navigate('Booking', { service, detailerId })}
                                        >
                                            <ButtonText color="$primary500" fontWeight="$bold">Book Now</ButtonText>
                                        </Button>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    ) : (
                        <Box bg="$backgroundCard" p="$6" rounded="$xl" alignItems="center" borderWidth={1} borderColor="$secondary900">
                            <Text color="$textDim">No services available yet</Text>
                        </Box>
                    )}
                </Box>

                {/* Reviews Section */}
                <Box px="$5" mb="$8">
                    <Heading size="md" color="$primary500" mb="$4">Reviews</Heading>

                    {reviews.length > 0 ? (
                        <VStack space="md">
                            {reviews.map((review, index) => (
                                <Box
                                    key={review.id}
                                    bg="$backgroundCard"
                                    p="$4"
                                    rounded="$xl"
                                    borderWidth={1}
                                    borderColor="$secondary900"
                                >
                                    <HStack justifyContent="space-between" alignItems="center" mb="$2">
                                        <Text color="$textLight" fontWeight="$bold">{review.customer_name}</Text>
                                        <Text color="$textDim" size="xs">{new Date(review.created_at).toLocaleDateString()}</Text>
                                    </HStack>
                                    <HStack space="xs" mb="$2">
                                        {[...Array(5)].map((_, i) => (
                                            <Icon
                                                key={i}
                                                as={StarIcon}
                                                size="xs"
                                                color={i < review.rating ? "$primary500" : "$secondary800"}
                                                fill={i < review.rating ? "$primary500" : "none"}
                                            />
                                        ))}
                                    </HStack>
                                    {review.comment && (
                                        <Text color="$textDim" size="sm">{review.comment}</Text>
                                    )}
                                </Box>
                            ))}
                        </VStack>
                    ) : (
                        <Box bg="$backgroundCard" p="$6" rounded="$xl" alignItems="center" borderWidth={1} borderColor="$secondary900">
                            <Text color="$textDim">No reviews yet</Text>
                        </Box>
                    )}
                </Box>
            </Animated.ScrollView>

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
                    opacity: scrollY.interpolate({
                        inputRange: [100, 200],
                        outputRange: [0, 1],
                        extrapolate: 'clamp'
                    }),
                    transform: [{
                        translateY: scrollY.interpolate({
                            inputRange: [100, 200],
                            outputRange: [100, 0],
                            extrapolate: 'clamp'
                        })
                    }],
                    zIndex: 100,
                    elevation: 10,
                }}
            >
                <ContactButtons
                    detailer={detailer}
                    user={user}
                    onCallPress={handleCallPress}
                    onMessagePress={() => navigation.navigate('Chat', {
                        recipientId: detailer.id,
                        recipientName: detailer.business_name,
                        recipientImage: detailer.profile_picture_url
                    })}
                    mb="$0"
                />
            </Animated.View>
        </Box>
    );
};

const styles = StyleSheet.create({
    heroContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
        overflow: 'hidden',
    },
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.7)', // Semi-transparent charcoal
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)', // Subtle Gold border
    }
});

export default DetailerProfileScreen;
