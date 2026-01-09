import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Pressable,
    Image,
    Icon,
    Heading,
    Spinner
} from '@gluestack-ui/themed';
import { UserIcon, MessageSquareIcon } from 'lucide-react-native';
import api from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const ChatListScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', fetchConversations);
            socket.on('new_message_notification', fetchConversations);
        }

        return () => {
            if (socket) {
                socket.off('receive_message', fetchConversations);
                socket.off('new_message_notification', fetchConversations);
            }
        };
    }, [socket]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => navigation.navigate('Chat', {
                conversationId: item.id,
                recipientId: item.other_user_id,
                recipientName: item.other_user_email.split('@')[0], // Fallback name
                recipientImage: item.other_user_profile_picture
            })}
        >
            {({ pressed }) => (
                <Box
                    bg={pressed ? "$secondary900" : "$backgroundCard"}
                    p="$4"
                    mb="$3"
                    rounded="$xl"
                    borderWidth={1}
                    borderColor="$secondary900"
                >
                    <HStack space="md" alignItems="center">
                        <Box
                            w="$12"
                            h="$12"
                            rounded="$full"
                            bg="$secondary800"
                            overflow="hidden"
                            justifyContent="center"
                            alignItems="center"
                            borderWidth={1}
                            borderColor="$secondary700"
                        >
                            {item.other_user_profile_picture ? (
                                <Image
                                    source={{ uri: item.other_user_profile_picture }}
                                    alt="Profile"
                                    w="100%"
                                    h="100%"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Icon as={UserIcon} size="md" color="$textDim" />
                            )}
                        </Box>

                        <VStack flex={1}>
                            <HStack justifyContent="space-between" alignItems="center" mb="$1">
                                <Text color="$textLight" fontWeight="$bold" size="md">
                                    {item.other_user_email.split('@')[0]}
                                </Text>
                                <Text color="$textDim" size="xs">
                                    {item.last_message_time ? new Date(item.last_message_time).toLocaleDateString() : ''}
                                </Text>
                            </HStack>
                            <Text color="$textDim" size="sm" numberOfLines={1}>
                                {item.last_message || 'Start a conversation'}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            )}
        </Pressable>
    );

    if (loading) {
        return (
            <Box flex={1} bg="$backgroundDark" justifyContent="center" alignItems="center">
                <Spinner size="large" color="$primary500" />
            </Box>
        );
    }

    return (
        <Box flex={1} bg="$backgroundDark" px="$4" pt="$4">
            <Heading color="$textLight" size="xl" mb="$4">Messages</Heading>

            {conversations.length > 0 ? (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            ) : (
                <EmptyState
                    icon={<Icon as={MessageSquareIcon} size="xl" color="$textDim" />}
                    title="No messages yet"
                    message="Connect with a detailer to start chatting about your car."
                />
            )}
        </Box>
    );
};

export default ChatListScreen;
