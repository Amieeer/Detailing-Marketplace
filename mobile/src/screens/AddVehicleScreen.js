import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonSpinner,
    ScrollView,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    Icon,
    ChevronDownIcon
} from '@gluestack-ui/themed';
import vehicleService from '../services/vehicleService';

import KeyboardToolbar from '../components/KeyboardToolbar';

const AddVehicleScreen = ({ navigation }) => {
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [color, setColor] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [type, setType] = useState('sedan');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!make || !model) {
            Alert.alert('Error', 'Make and Model are required');
            return;
        }

        setLoading(true);
        try {
            await vehicleService.addVehicle({
                make,
                model,
                year: year ? parseInt(year) : null,
                color,
                license_plate: licensePlate,
                type
            });
            Alert.alert('Success', 'Vehicle added successfully');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundDark">
            <KeyboardToolbar />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Heading size="xl" color="$textLight" mb="$6">Add New Vehicle</Heading>

                <VStack space="lg">
                    <HStack space="md">
                        <FormControl flex={1}>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Make *</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={make}
                                    onChangeText={setMake}
                                    placeholder="e.g. Tesla"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl flex={1}>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Model *</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={model}
                                    onChangeText={setModel}
                                    placeholder="e.g. Model 3"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>
                    </HStack>

                    <HStack space="md">
                        <FormControl flex={1}>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Year</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={year}
                                    onChangeText={setYear}
                                    placeholder="2023"
                                    keyboardType="number-pad"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>

                        <FormControl flex={1}>
                            <FormControlLabel mb="$1">
                                <FormControlLabelText color="$textLight">Color</FormControlLabelText>
                            </FormControlLabel>
                            <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                                <InputField
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="e.g. Black"
                                    color="$textLight"
                                    placeholderTextColor="$textDim"
                                    inputAccessoryViewID="keyboardToolbar"
                                />
                            </Input>
                        </FormControl>
                    </HStack>

                    <FormControl>
                        <FormControlLabel mb="$1">
                            <FormControlLabelText color="$textLight">License Plate</FormControlLabelText>
                        </FormControlLabel>
                        <Input variant="outline" size="md" borderColor="$secondary900" $focus-borderColor="$primary500">
                            <InputField
                                value={licensePlate}
                                onChangeText={setLicensePlate}
                                placeholder="e.g. ABC-1234"
                                autoCapitalize="characters"
                                color="$textLight"
                                placeholderTextColor="$textDim"
                                inputAccessoryViewID="keyboardToolbar"
                            />
                        </Input>
                    </FormControl>

                    {/* Note: Select component might need specific Gluestack setup, falling back to simple buttons if complex */}
                    <FormControl>
                        <FormControlLabel mb="$1">
                            <FormControlLabelText color="$textLight">Vehicle Type</FormControlLabelText>
                        </FormControlLabel>
                        <HStack space="sm" flexWrap="wrap">
                            {['sedan', 'suv', 'truck', 'van', 'coupe'].map((t) => (
                                <Button
                                    key={t}
                                    size="sm"
                                    variant={type === t ? "solid" : "outline"}
                                    action={type === t ? "primary" : "secondary"}
                                    onPress={() => setType(t)}
                                    mb="$2"
                                    borderColor="$secondary800"
                                    bg={type === t ? "$primary500" : "transparent"}
                                >
                                    <ButtonText color={type === t ? "$black" : "$textDim"} textTransform="capitalize">
                                        {t}
                                    </ButtonText>
                                </Button>
                            ))}
                        </HStack>
                    </FormControl>

                    <Button
                        size="xl"
                        action="primary"
                        variant="solid"
                        onPress={handleSubmit}
                        isDisabled={loading}
                        bg="$primary500"
                        mt="$6"
                        rounded="$lg"
                    >
                        {loading ? (
                            <ButtonSpinner color="$white" />
                        ) : (
                            <ButtonText fontWeight="bold">Save Vehicle</ButtonText>
                        )}
                    </Button>
                </VStack>
            </ScrollView>
        </Box>
    );
};

export default AddVehicleScreen;
