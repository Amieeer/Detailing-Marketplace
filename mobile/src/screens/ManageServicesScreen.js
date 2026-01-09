import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, Alert, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    Box,
    Text,
    HStack,
    Heading,
    Pressable,
    Spinner,
    Center,
    Icon
} from '@gluestack-ui/themed';
import { PlusIcon } from 'lucide-react-native';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';

const ServiceItem = React.memo(({ item, index, onDelete, onToggle, onEdit }) => {
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
            <ServiceCard
                service={item}
                onDelete={onDelete}
                onToggle={onToggle}
                onEdit={onEdit}
            />
        </Animated.View>
    );
});

const ManageServicesScreen = () => {
    const navigation = useNavigation();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/services/my-services');
            setServices(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchServices();
        }, [])
    );

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Service',
            'Are you sure you want to delete this service?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/services/${id}`);
                            fetchServices();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete service');
                        }
                    },
                },
            ]
        );
    };

    const handleToggle = async (id) => {
        try {
            await api.patch(`/services/${id}/toggle`);
            // Optimistic update or refetch
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleEdit = (service) => {
        navigation.navigate('AddEditService', { service });
    };

    const renderServiceItem = ({ item, index }) => (
        <ServiceItem
            item={item}
            index={index}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onEdit={handleEdit}
        />
    );

    return (
        <Box flex={1} bg="$backgroundDark">
            <Box p="$5" pb="$2">
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="xl" color="$textLight">My Services</Heading>
                    <Pressable
                        bg="$primary500"
                        px="$3"
                        py="$2"
                        rounded="$lg"
                        onPress={() => navigation.navigate('AddEditService')}
                    >
                        <HStack space="xs" alignItems="center">
                            <Icon as={PlusIcon} color="$black" size="sm" />
                            <Text color="$black" fontWeight="bold" size="sm">Add New</Text>
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
                    data={services}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderServiceItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <Center py="$10">
                            <Text color="$textDim">No services found. Add one to get started!</Text>
                        </Center>
                    }
                />
            )}
        </Box>
    );
};

export default ManageServicesScreen;
