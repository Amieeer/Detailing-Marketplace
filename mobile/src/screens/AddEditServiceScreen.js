import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
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
    FormControlLabelText
} from '@gluestack-ui/themed';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

import KeyboardToolbar from '../components/KeyboardToolbar';

const AddEditServiceScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const editingService = route.params?.service;
    const isEditing = !!editingService;

    const [formData, setFormData] = useState({
        name: editingService?.name || '',
        description: editingService?.description || '',
        price: editingService?.price?.toString() || '',
        duration_minutes: editingService?.duration_minutes?.toString() || '',
        image_url: editingService?.image_url || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.duration_minutes) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                duration_minutes: parseInt(formData.duration_minutes),
            };

            if (isEditing) {
                await api.put(`/services/${editingService.id}`, payload);
                Alert.alert('Success', 'Service updated successfully');
            } else {
                await api.post('/services', payload);
                Alert.alert('Success', 'Service created successfully');
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundDark">
            <KeyboardToolbar />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Heading size="xl" color="$textLight" mb="$6">
                    {isEditing ? 'Edit Service' : 'Add New Service'}
                </Heading>

                <VStack space="lg">
                    <Box>
                        <Text color="$textLight" fontWeight="bold" mb="$2">Service Image</Text>
                        <ImageUpload
                            label="Add Service Photo"
                            initialImage={formData.image_url}
                            onImageUploaded={(url) => handleChange('image_url', url)}
                        />
                    </Box>

                    <FormControl>
                        <FormControlLabel mb="$1">
                            <FormControlLabelText color="$textLight">Service Name *</FormControlLabelText>
                        </FormControlLabel>
                        <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                            <InputField
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                                placeholder="e.g., Full Interior Detail"
                                color="$textLight"
                                placeholderTextColor="$textDim"
                                inputAccessoryViewID="keyboardToolbar"
                            />
                        </Input>
                    </FormControl>

                    <FormControl>
                        <FormControlLabel mb="$1">
                            <FormControlLabelText color="$textLight">Description</FormControlLabelText>
                        </FormControlLabel>
                        <Textarea size="md" borderColor="$secondary900" $focus-borderColor="$primary500" h={100}>
                            <TextareaInput
                                value={formData.description}
                                onChangeText={(text) => handleChange('description', text)}
                                placeholder="Describe what's included..."
                                color="$textLight"
                                placeholderTextColor="$textDim"
                                inputAccessoryViewID="keyboardToolbar"
                            />
                        </Textarea>
                    </FormControl>

                    <HStack space="md">
                        <FormControl flex={1}>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Price ($) *</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={formData.price}
                                    onChangeText={(text) => handleChange('price', text)}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl flex={1}>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Duration (mins) *</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={formData.duration_minutes}
                                    onChangeText={(text) => handleChange('duration_minutes', text)}
                                    placeholder="60"
                                    keyboardType="number-pad"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>
                    </HStack>

                    <Button
                        size="lg"
                        action="primary"
                        variant="solid"
                        onPress={handleSubmit}
                        isDisabled={loading}
                        bg="$primary500"
                        mt="$4"
                    >
                        {loading ? (
                            <ButtonSpinner color="$white" />
                        ) : (
                            <ButtonText fontWeight="bold">
                                {isEditing ? 'Update Service' : 'Create Service'}
                            </ButtonText>
                        )}
                    </Button>
                </VStack>
            </ScrollView>
        </Box>
    );
};

export default AddEditServiceScreen;
