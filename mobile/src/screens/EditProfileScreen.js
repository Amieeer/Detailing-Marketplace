import React, { useState, useEffect, useContext, useRef } from 'react';
import { Alert, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    Box,
    VStack,
    Text,
    Heading,
    Input,
    InputField,
    Textarea,
    TextareaInput,
    Button,
    ButtonText,
    ButtonSpinner,
    ScrollView,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Center
} from '@gluestack-ui/themed';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import KeyboardToolbar from '../components/KeyboardToolbar';

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        bio: '',
        phone_number: '',
        service_radius_km: '',
        profile_picture_url: null,
        cover_image: null,
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const isDetailer = user?.role === 'detailer';

    useEffect(() => {
        fetchProfile();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            const { profile, phone_number, cover_image } = res.data;
            setFormData({
                business_name: profile?.business_name || '',
                bio: profile?.bio || '',
                phone_number: phone_number || '',
                service_radius_km: profile?.service_radius_km?.toString() || '',
                profile_picture_url: profile?.profile_picture_url || null,
                cover_image: cover_image || null,
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                service_radius_km: parseInt(formData.service_radius_km) || 0,
            };

            await api.put('/users/profile', payload);
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <ButtonSpinner color="$primary500" size="large" />
            </Center>
        );
    }

    return (
        <Box flex={1} bg="$backgroundDark">
            <KeyboardToolbar />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Heading size="xl" color="$textLight" mb="$6">Edit Profile</Heading>

                    <VStack space="md" mb="$6">
                        <Box>
                            <Text color="$textDim" mb="$2" size="sm">Cover Photo</Text>
                            <ImageUpload
                                label="Change Cover Photo"
                                initialImage={formData.cover_image}
                                onImageUploaded={(url) => handleChange('cover_image', url)}
                                height={150}
                                width="100%"
                                borderRadius={10}
                            />
                        </Box>

                        <Center>
                            <ImageUpload
                                label="Change Profile Photo"
                                initialImage={formData.profile_picture_url}
                                onImageUploaded={(url) => handleChange('profile_picture_url', url)}
                            />
                        </Center>
                    </VStack>

                    <VStack space="md">
                        <FormControl>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">{isDetailer ? 'Business Name' : 'Full Name'}</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={formData.business_name}
                                    onChangeText={(text) => handleChange('business_name', text)}
                                    placeholder={isDetailer ? "Your Business Name" : "Your Name"}
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Phone Number</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={formData.phone_number}
                                    onChangeText={(text) => handleChange('phone_number', text)}
                                    placeholder="+1 234 567 8900"
                                    keyboardType="phone-pad"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">{isDetailer ? 'Bio / About' : 'Bio (Optional)'}</FormControlLabelText>
                            </FormControlLabel>
                            <Textarea size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <TextareaInput
                                    value={formData.bio}
                                    onChangeText={(text) => handleChange('bio', text)}
                                    placeholder={isDetailer ? "Tell customers about your services..." : "Tell us a bit about yourself..."}
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Textarea>
                        </FormControl>

                        {isDetailer && (
                            <FormControl>
                                <FormControlLabel mb="$1">
                                    <FormControlLabelText color="$textLight">Service Radius (km)</FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                    <InputField
                                        value={formData.service_radius_km}
                                        onChangeText={(text) => handleChange('service_radius_km', text)}
                                        placeholder="e.g. 30"
                                        keyboardType="number-pad"
                                        color="$textLight"
                                        placeholderTextColor="$textDim"
                                        inputAccessoryViewID="keyboardToolbar"
                                    />
                                </Input>
                            </FormControl>
                        )}

                        <Button
                            size="lg"
                            action="primary"
                            variant="solid"
                            onPress={handleSubmit}
                            isDisabled={saving}
                            bg="$primary500"
                            mt="$4"
                        >
                            {saving ? <ButtonSpinner color="$white" /> : <ButtonText fontWeight="$bold">Save Changes</ButtonText>}
                        </Button>

                        <Button
                            size="lg"
                            action="negative"
                            variant="outline"
                            onPress={() => {
                                if (Platform.OS === 'web') {
                                    if (window.confirm('Are you sure you want to logout?')) {
                                        logout().catch(console.error);
                                    }
                                } else {
                                    Alert.alert(
                                        'Logout',
                                        'Are you sure you want to logout?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Logout',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    try {
                                                        await logout();
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }
                            }}
                            mt="$4"
                            borderColor="$red500"
                        >
                            <ButtonText color="$red500" fontWeight="bold">Log Out</ButtonText>
                        </Button>
                    </VStack>
                </Animated.View>
            </ScrollView>
        </Box>
    );
};

export default EditProfileScreen;
