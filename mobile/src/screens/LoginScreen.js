
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Alert, Animated } from 'react-native';
import {
    Box,
    VStack,
    Text,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonSpinner,
    Center,
    FormControl,
    Icon,
    FormControlLabel,
    FormControlLabelText,
    HStack,
    Pressable
} from '@gluestack-ui/themed';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LockIcon } from 'lucide-react-native';

import KeyboardToolbar from '../components/KeyboardToolbar';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigation = useNavigation();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            // Navigation is handled by AppNavigator based on auth state
        } catch (error) {
            console.error(error);
            let errorMsg = 'Invalid credentials';

            if (error.response?.data) {
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMsg = error.response.data.errors
                        .map(err => `${err.field}: ${err.message}`)
                        .join('\n');
                } else {
                    errorMsg = error.response.data.message || error.message;
                }
            }

            Alert.alert('Login Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundDark">
            <KeyboardToolbar />
            <Box flex={1} justifyContent="center" px="$6">
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Center mb="$8">
                        <Box bg="$primary500" p="$4" rounded="$full" mb="$4" shadowColor="$primary500" shadowOffset={{ width: 0, height: 0 }} shadowOpacity={0.5} shadowRadius={20}>
                            <Icon as={LockIcon} size="xl" color="$backgroundDark" />
                        </Box>
                        <Heading size="3xl" color="$textLight" fontWeight="bold">Welcome Back</Heading>
                        <Text color="$textDim" size="md" mt="$2">Sign in to continue</Text>
                    </Center>

                    <VStack space="xl">
                        <FormControl>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Email</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="xl" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Password</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="xl" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    type="password"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <Button
                            size="xl"
                            variant="solid"
                            action="primary"
                            isDisabled={loading}
                            onPress={handleLogin}
                            bg="$primary500"
                            mt="$4"
                            rounded="$xl"
                        >
                            {loading ? <ButtonSpinner color="#000000" /> : <ButtonText color="#000000" fontWeight="bold">Sign In</ButtonText>}
                        </Button>

                        <HStack justifyContent="center" alignItems="center" space="sm" mt="$4">
                            <Text color="$textDim" size="sm">Don't have an account?</Text>
                            <Pressable onPress={() => navigation.navigate('Register')}>
                                <Text color="$primary500" fontWeight="bold" size="sm">Sign Up</Text>
                            </Pressable>
                        </HStack>
                    </VStack>
                </Animated.View>
            </Box>
        </Box>
    );
};

export default LoginScreen;
