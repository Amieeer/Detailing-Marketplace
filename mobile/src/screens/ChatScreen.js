import React, { useState, useEffect, useContext, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Input,
    InputField,
    Button,
    ButtonIcon,
    Avatar,
    AvatarImage,
    AvatarFallbackText,
    Spinner,
    Icon
} from '@gluestack-ui/themed';
import { SendIcon, ArrowLeftIcon } from 'lucide-react-native';
import api from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
    const { conversationId, recipientId, recipientName, recipientImage } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    const flatListRef = useRef(null);

    // If we don't have a conversationId yet (starting new chat), we need to fetch/create it
    const [activeConversationId, setActiveConversationId] = useState(conversationId);

    useEffect(() => {
        const initChat = async () => {
            if (!activeConversationId && recipientId) {
                try {
                    const res = await api.post('/chat/conversations', { recipientId });
                    setActiveConversationId(res.data.id);
                } catch (error) {
                    console.error('Error starting conversation:', error);
                }
            }
        };
        initChat();
    }, [recipientId, activeConversationId]);

    useEffect(() => {
        if (!activeConversationId) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/conversations/${activeConversationId}/messages`);
                setMessages(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setLoading(false);
            }
        };

        fetchMessages();

        if (socket) {
            socket.emit('join_conversation', activeConversationId);

            socket.on('receive_message', (message) => {
                if (message.conversation_id === activeConversationId) {
                    setMessages((prev) => [...prev, message]);
                    // Scroll to bottom on new message
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                }
            });
        }

        return () => {
            if (socket) {
                socket.emit('leave_conversation', activeConversationId);
                socket.off('receive_message');
            }
        };
    }, [activeConversationId, socket]);

    const handleSend = () => {
        if (!newMessage.trim() || !socket || !activeConversationId) return;

        const messageData = {
            conversationId: activeConversationId,
            content: newMessage.trim(),
            recipientId
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const renderMessage = ({ item }) => {
        const isMe = item.sender_id === user.id;
        return (
            <Box
                alignSelf={isMe ? 'flex-end' : 'flex-start'}
                bg={isMe ? '$primary500' : '$secondary800'}
                px="$4"
                py="$2"
                rounded="$2xl"
                borderBottomRightRadius={isMe ? '$none' : '$2xl'}
                borderBottomLeftRadius={isMe ? '$2xl' : '$none'}
                mb="$2"
                maxWidth="80%"
            >
                <Text color="$white" size="md">{item.content}</Text>
                <Text color="$textDim" size="xs" textAlign="right" mt="$1" opacity={0.7}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </Box>
        );
    };

    return (
        <Box flex={1} bg="$backgroundDark">
            {/* Header */}
            <Box pt="$12" pb="$4" px="$4" bg="$backgroundCard" borderBottomWidth={1} borderColor="$secondary900">
                <HStack alignItems="center" space="md">
                    <Button variant="link" onPress={() => navigation.goBack()} p="$0">
                        <Icon as={ArrowLeftIcon} color="$textLight" size="xl" />
                    </Button>

                    <Avatar size="sm" bg="$secondary700">
                        {recipientImage ? (
                            <AvatarImage source={{ uri: recipientImage }} />
                        ) : (
                            <AvatarFallbackText>{recipientName}</AvatarFallbackText>
                        )}
                    </Avatar>

                    <VStack>
                        <Text color="$textLight" fontWeight="$bold" size="lg">{recipientName}</Text>
                        <Text color="$green500" size="xs">Online</Text>
                    </VStack>
                </HStack>
            </Box>

            {loading ? (
                <Box flex={1} justifyContent="center" alignItems="center">
                    <Spinner size="large" color="$primary500" />
                </Box>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <Box p="$4" bg="$backgroundCard" borderTopWidth={1} borderColor="$secondary900">
                    <HStack space="md" alignItems="center">
                        <Input flex={1} variant="rounded" size="md" bg="$secondary900" borderWidth={0}>
                            <InputField
                                placeholder="Type a message..."
                                color="$textLight"
                                value={newMessage}
                                onChangeText={setNewMessage}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                        </Input>
                        <Button
                            rounded="$full"
                            w="$10"
                            h="$10"
                            p="$0"
                            bg={newMessage.trim() ? "$primary500" : "$secondary700"}
                            onPress={handleSend}
                            disabled={!newMessage.trim()}
                        >
                            <ButtonIcon as={SendIcon} color="$white" />
                        </Button>
                    </HStack>
                </Box>
            </KeyboardAvoidingView>
        </Box>
    );
};

export default ChatScreen;
