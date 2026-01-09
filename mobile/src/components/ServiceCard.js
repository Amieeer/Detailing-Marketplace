import React, { useRef } from 'react';
import {
    Box,
    Text,
    Pressable,
    HStack,
    VStack,
    Switch,
    Icon
} from '@gluestack-ui/themed';
import { ClockIcon } from 'lucide-react-native';
import { Animated } from 'react-native';

const ServiceCard = ({ service, onEdit, onDelete, onToggle }) => {
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

    return (
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
                <HStack justifyContent="space-between" alignItems="flex-start" mb="$2">
                    <VStack flex={1} mr="$2">
                        <Text color="$textLight" fontWeight="bold" size="lg" mb="$1">{service.name}</Text>
                        <Text color="$primary400" fontWeight="bold" size="md">${service.price}</Text>
                    </VStack>
                    <Switch
                        value={service.is_active}
                        onValueChange={() => onToggle(service.id)}
                        trackColor={{ false: '$secondary800', true: '$primary500' }}
                        thumbColor={service.is_active ? '$white' : '$textDim'}
                    />
                </HStack>

                <Text color="$textDim" size="sm" mb="$4" numberOfLines={2}>
                    {service.description}
                </Text>

                <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="xs" alignItems="center">
                        <Icon as={ClockIcon} size="sm" color="$textDim" />
                        <Text color="$textDim" size="sm">{service.duration_minutes} mins</Text>
                    </HStack>

                    <HStack space="md">
                        <Pressable onPress={() => onEdit(service)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                            <Text color="$primary500" fontWeight="bold" size="sm">Edit</Text>
                        </Pressable>
                        <Pressable onPress={() => onDelete(service.id)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                            <Text color="$red500" fontWeight="bold" size="sm">Delete</Text>
                        </Pressable>
                    </HStack>
                </HStack>
            </Box>
        </Animated.View>
    );
};

export default ServiceCard;
