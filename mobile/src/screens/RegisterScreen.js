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
    ScrollView,
    HStack,
    Pressable
} from '@gluestack-ui/themed';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import locationService from '../services/locationService';
import KeyboardToolbar from '../components/KeyboardToolbar';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('customer'); // default to customer
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const [address, setAddress] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (role === 'detailer' && !address) {
            Alert.alert('Error', 'Detailers must provide a business address');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            let locationCoordinates = null;

            if (role === 'detailer') {
                setIsGeocoding(true);
                const coords = await locationService.geocodeAddress(address);
                setIsGeocoding(false);

                if (!coords) {
                    Alert.alert('Error', 'Could not find address. Please try a more specific address.');
                    setIsSubmitting(false);
                    return;
                }
                locationCoordinates = { latitude: coords.latitude, longitude: coords.longitude };
            }

            await api.post('/auth/register', {
                email,
                password,
                role,
                phone_number: phoneNumber || null,
                location_coordinates: locationCoordinates,
                business_address: address // Optional: send address string too if backend wants it
            });

            // Auto-login after registration
            await login(email, password);

            Alert.alert('Success', 'Account created successfully!');
            // Navigation handled by AuthContext/AppNavigator
        } catch (error) {
            console.error(error);
            let errorMsg = 'Unknown Error';

            if (error.response?.data) {
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    // Handle Zod validation errors
                    errorMsg = error.response.data.errors
                        .map(err => `${err.field}: ${err.message}`)
                        .join('\n');
                } else {
                    errorMsg = error.response.data.message || error.message;
                }
            } else {
                errorMsg = error.message;
            }

            Alert.alert('Registration Failed', errorMsg);
        } finally {
            setIsSubmitting(false);
            setIsGeocoding(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundDark">
            <KeyboardToolbar />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }} keyboardDismissMode="on-drag">
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Center mb="$8">
                        <Heading size="2xl" color="$primary500" mb="$1" fontWeight="$bold">Create Account</Heading>
                        <Text color="$textDim" size="md">Join the Elite Network</Text>
                    </Center>

                    <VStack space="md">
                        <FormControl>
                            <Input variant="outline" size="lg" borderColor="$primary800" $focus-borderColor="$primary500">
                                <InputField
                                    placeholder="Email *"
                                    placeholderTextColor="$textDim"
                                    color="$textLight"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <Input variant="outline" size="lg" borderColor="$primary800" $focus-borderColor="$primary500">
                                <InputField
                                    placeholder="Phone Number (Optional)"
                                    placeholderTextColor="$textDim"
                                    color="$textLight"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <Input variant="outline" size="lg" borderColor="$primary800" $focus-borderColor="$primary500">
                                <InputField
                                    placeholder="Password *"
                                    placeholderTextColor="$textDim"
                                    color="$textLight"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                            <Text color="$textDim" size="xs" mt="$1">Must be at least 8 characters.</Text>
                        </FormControl>

                        <FormControl>
                            <Input variant="outline" size="lg" borderColor="$primary800" $focus-borderColor="$primary500">
                                <InputField
                                    placeholder="Confirm Password *"
                                    placeholderTextColor="$textDim"
                                    color="$textLight"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <Box>
                            <Text color="$textDim" mb="$2" size="sm">Account Type</Text>
                            <HStack space="md">
                                <Pressable
                                    flex={1}
                                    onPress={() => setRole('customer')}
                                    bg={role === 'customer' ? "$primary500" : "$backgroundDark"}
                                    borderColor="$primary500"
                                    borderWidth={1}
                                    p="$3"
                                    rounded="$md"
                                    alignItems="center"
                                >
                                    <Text color={role === 'customer' ? "#000000" : "$textDim"} fontWeight="bold">Customer</Text>
                                </Pressable>
                                <Pressable
                                    flex={1}
                                    onPress={() => setRole('detailer')}
                                    bg={role === 'detailer' ? "$primary500" : "$backgroundDark"}
                                    borderColor="$primary500"
                                    borderWidth={1}
                                    p="$3"
                                    rounded="$md"
                                    alignItems="center"
                                >
                                    <Text color={role === 'detailer' ? "#000000" : "$textDim"} fontWeight="bold">Detailer</Text>
                                </Pressable>
                            </HStack>
                        </Box>

                        {role === 'detailer' && (
                            <FormControl>
                                <Text color="$textDim" mb="$1" size="sm">Business Address *</Text>
                                <Input variant="outline" size="lg" borderColor="$primary800" $focus-borderColor="$primary500">
                                    <InputField
                                        placeholder="123 Main St, City, State"
                                        placeholderTextColor="$textDim"
                                        color="$textLight"
                                        value={address}
                                        onChangeText={setAddress}
                                        inputAccessoryViewID="keyboardToolbar"
                                    />
                                </Input>
                                <Text color="$textDim" size="xs" mt="$1">Used to show your location on the map.</Text>
                            </FormControl>
                        )}

                        <Button
                            size="xl"
                            variant="solid"
                            action="primary"
                            isDisabled={isSubmitting || isGeocoding}
                            onPress={handleRegister}
                            bg="$primary500"
                            mt="$6"
                            rounded="$lg"
                        >
                            {isSubmitting || isGeocoding ? <ButtonSpinner color="#000000" /> : <ButtonText color="#000000" fontWeight="$bold">Create Account</ButtonText>}
                        </Button>

                        <Button
                            variant="link"
                            onPress={() => navigation.goBack()}
                            mt="$4"
                        >
                            <ButtonText color="$secondary300">Already have an account? Login</ButtonText>
                        </Button>
                    </VStack>
                </Animated.View>
            </ScrollView>
        </Box>
    );
};

export default RegisterScreen;
