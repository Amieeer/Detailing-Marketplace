import React, { useMemo } from 'react';
import {
    Box,
    Text,
    Pressable,
    HStack,
    VStack,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    Icon,
    Badge,
    BadgeText,
    Button,
    ButtonText,
    Image,
    Divider
} from '@gluestack-ui/themed';
import { MapPinIcon, CheckCircleIcon, StarIcon, HeartIcon, BadgeCheckIcon } from 'lucide-react-native';
import { Animated } from 'react-native';
import locationService from '../services/locationService';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2000&auto=format&fit=crop';

const DetailerCard = ({ detailer, onPress, isFavorite, onToggleFavorite }) => {
    const rating = parseFloat(detailer.rating) || 0;
    const distance = detailer.distance;
    const scale = useMemo(() => new Animated.Value(1), []);
    const heartScale = useMemo(() => new Animated.Value(1), []);

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

    const handleFavoritePress = () => {
        Animated.sequence([
            Animated.spring(heartScale, {
                toValue: 1.4,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(heartScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            })
        ]).start();
        onToggleFavorite();
    };

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
                style={{
                    transform: [{ scale }],
                }}
            >
                <Box
                    bg="$backgroundCard"
                    mb="$6"
                    rounded="$3xl"
                    overflow="hidden"
                    borderWidth={1}
                    borderColor="$secondary800"
                    softShadow="4"
                >
                    {/* Cover Image Section */}
                    <Box height={140} width="100%" bg="$secondary900">
                        <Image
                            source={{ uri: detailer.cover_image || DEFAULT_COVER }}
                            alt="Detailer Cover"
                            size="full"
                            resizeMode="cover"
                        />
                        {/* Favorite Button (Over Cover) */}
                        <Box position="absolute" top="$3" right="$3">
                            <Pressable
                                onPress={handleFavoritePress}
                                p="$2"
                                bg="rgba(0,0,0,0.3)"
                                rounded="$full"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                                    <Icon
                                        as={HeartIcon}
                                        size="md"
                                        color={isFavorite ? "$red500" : "$white"}
                                        fill={isFavorite ? "#ef4444" : "transparent"}
                                    />
                                </Animated.View>
                            </Pressable>
                        </Box>

                        {/* Verified Pro Badge (Over Cover) */}
                        {detailer.is_verified_pro && (
                            <Box position="absolute" top="$3" left="$3">
                                <Badge action="success" variant="solid" rounded="$full" px="$3">
                                    <Icon as={BadgeCheckIcon} size="xs" color="$white" mr="$1" />
                                    <BadgeText color="$white" fontSize="$xs" fontWeight="$bold">VERIFIED PRO</BadgeText>
                                </Badge>
                            </Box>
                        )}
                    </Box>

                    <Box p="$4" pt="$0">
                        {/* Avatar Overlap */}
                        <HStack justifyContent="space-between" alignItems="flex-end" mt="-25%">
                            <Avatar bgColor="$primary900" size="xl" borderColor="$backgroundCard" borderWidth={4} rounded="$full" softShadow="2">
                                {detailer.profile_picture_url ? (
                                    <AvatarImage source={{ uri: detailer.profile_picture_url }} alt={detailer.business_name} />
                                ) : (
                                    <AvatarFallbackText color="$primary300">
                                        {detailer.business_name || 'D'}
                                    </AvatarFallbackText>
                                )}
                            </Avatar>

                            <VStack alignItems="flex-end" pb="$2">
                                <HStack alignItems="center" space="xs" borderColor="$primary500" borderWidth={1} px="$2" py="$1" rounded="$lg">
                                    <Icon as={StarIcon} size="xs" color="$primary500" fill="$primary500" />
                                    <Text color="$textLight" fontWeight="$bold" size="sm">
                                        {detailer.rating ? rating.toFixed(1) : 'New'}
                                    </Text>
                                    <Text color="$textDim" size="xs">({detailer.jobs_completed || 0} jobs)</Text>
                                </HStack>
                            </VStack>
                        </HStack>

                        {/* Title and Info */}
                        <VStack mt="$3" space="xs">
                            <HStack justifyContent="space-between" alignItems="center">
                                <Text color="$textLight" fontWeight="$bold" size="xl" flex={1}>
                                    {detailer.business_name || 'Detailer'}
                                </Text>
                                <Text color="$primary500" fontWeight="$bold" size="xl">
                                    $50+
                                </Text>
                            </HStack>

                            <HStack space="xs" alignItems="center">
                                <Icon as={MapPinIcon} size="xs" color="$textDim" />
                                <Text color="$textDim" size="sm">
                                    {distance !== null && distance !== undefined
                                        ? `${locationService.formatDistance(distance)} away`
                                        : `${detailer.service_radius_km || 20}km radius`}
                                </Text>
                            </HStack>
                        </VStack>

                        {detailer.bio && (
                            <Text color="$textDim" size="sm" numberOfLines={2} mt="$3" lineHeight="$sm">
                                {detailer.bio}
                            </Text>
                        )}

                        <Divider my="$4" bg="$backgroundDark" />

                        <HStack justifyContent="space-between" alignItems="center">
                            <HStack space="md">
                                <HStack space="xs" alignItems="center">
                                    <Icon as={CheckCircleIcon} size="xs" color="$primary500" />
                                    <Text color="$textDim" size="xs">Background Checked</Text>
                                </HStack>
                            </HStack>

                            <Button
                                size="sm"
                                action="primary"
                                variant="solid"
                                rounded="$xl"
                                bg="$primary500"
                                onPress={onPress}
                                px="$4"
                            >
                                <ButtonText color="#000000" fontWeight="$bold">View Profile</ButtonText>
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            </Animated.View>
        </Pressable>
    );
};

export default DetailerCard;
