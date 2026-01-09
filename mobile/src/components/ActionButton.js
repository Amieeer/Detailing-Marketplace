import React, { useRef } from 'react';
import { Pressable, Box, Text, HStack, VStack, Badge, BadgeText } from '@gluestack-ui/themed';
import { Animated } from 'react-native';

const ActionButton = ({ icon, title, subtitle, onPress, badge }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
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
                    p="$4"
                    mb="$3"
                    rounded="$xl"
                    borderWidth={1}
                    borderColor="$secondary900"
                    hardShadow="1"
                >
                    <HStack alignItems="center" space="md">
                        <Box
                            w="$12"
                            h="$12"
                            rounded="$full"
                            bg="$backgroundDark"
                            justifyContent="center"
                            alignItems="center"
                            borderWidth={1}
                            borderColor="$secondary900"
                        >
                            {/* Handle both string icons and component icons */}
                            {typeof icon === 'string' ? <Text size="2xl">{icon}</Text> : icon}
                        </Box>

                        <VStack flex={1}>
                            <Text color="$textLight" fontWeight="$bold" size="md" mb="$1">
                                {title}
                            </Text>
                            <Text color="$textDim" size="xs">
                                {subtitle}
                            </Text>
                        </VStack>

                        {badge > 0 && (
                            <Badge
                                bg="$primary500"
                                size="md"
                                variant="solid"
                                borderRadius="$full"
                                zIndex={1}
                            >
                                <BadgeText color="$white" fontWeight="$bold">{badge}</BadgeText>
                            </Badge>
                        )}
                    </HStack>
                </Box>
            </Animated.View>
        </Pressable>
    );
};

export default ActionButton;
