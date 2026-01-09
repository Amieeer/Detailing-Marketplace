import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, Alert, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Pressable,
    Spinner,
    Center,
    Icon,
    Button,
    ButtonText
} from '@gluestack-ui/themed';
import { PlusIcon, CarIcon, TrashIcon } from 'lucide-react-native';
import vehicleService from '../services/vehicleService';

const VehicleItem = React.memo(({ item, index, onDelete }) => {
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
            >
                <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="md" alignItems="center">
                        <Box bg="$secondary900" p="$3" rounded="$full">
                            <Icon as={CarIcon} size="lg" color="$primary500" />
                        </Box>
                        <VStack>
                            <Heading size="md" color="$textLight">{item.make} {item.model}</Heading>
                            <Text color="$textDim" size="sm">{item.year} • {item.color}</Text>
                            {item.license_plate && (
                                <Box bg="$backgroundDark" px="$2" py="$1" rounded="$sm" mt="$1" alignSelf="flex-start">
                                    <Text color="$textDim" size="xs" fontFamily="monospace">{item.license_plate.toUpperCase()}</Text>
                                </Box>
                            )}
                        </VStack>
                    </HStack>
                    <Pressable onPress={() => onDelete(item.id)} p="$2">
                        <Icon as={TrashIcon} size="sm" color="$red500" />
                    </Pressable>
                </HStack>
            </Box>
        </Animated.View>
    );
});

const VehicleListScreen = () => {
    const navigation = useNavigation();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleService.getMyVehicles();
            setVehicles(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
        }, [])
    );

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Vehicle',
            'Are you sure you want to remove this vehicle?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await vehicleService.deleteVehicle(id);
                            fetchVehicles();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete vehicle');
                        }
                    },
                },
            ]
        );
    };

    const renderVehicle = ({ item, index }) => (
        <VehicleItem
            item={item}
            index={index}
            onDelete={handleDelete}
        />
    );

    return (
        <Box flex={1} bg="$backgroundDark">
            <Box p="$5" pb="$2">
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="xl" color="$textLight">My Garage</Heading>
                    <Pressable
                        bg="$primary500"
                        px="$3"
                        py="$2"
                        rounded="$lg"
                        onPress={() => navigation.navigate('AddVehicle')}
                    >
                        <HStack space="xs" alignItems="center">
                            <Icon as={PlusIcon} color="$black" size="sm" />
                            <Text color="$black" fontWeight="bold" size="sm">Add Car</Text>
                        </HStack>
                    </Pressable>
                </HStack>
            </Box>

            {loading ? (
                <Center flex={1}>
                    <Spinner size="large" color="$primary500" />
                </Center>
            ) : (
                <FlatList
                    data={vehicles}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderVehicle}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <Center py="$10">
                            <Icon as={CarIcon} size={64} color="$secondary800" mb="$4" />
                            <Text color="$textDim" textAlign="center" mb="$6">
                                No vehicles added yet. Add your car to make booking easier!
                            </Text>
                            <Button action="primary" variant="outline" onPress={() => navigation.navigate('AddVehicle')} borderColor="$primary500">
                                <ButtonText color="$primary500">Add Your First Car</ButtonText>
                            </Button>
                        </Center>
                    }
                />
            )}
        </Box>
    );
};

export default VehicleListScreen;
