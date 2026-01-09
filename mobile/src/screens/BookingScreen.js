import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, FlatList, Dimensions, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    ScrollView,
    Pressable,
    Button,
    ButtonText,
    ButtonSpinner,
    Input,
    InputField,
    Icon,
    Divider,
    Center,
    Spinner
} from '@gluestack-ui/themed';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    NavigationIcon,
    CarIcon,
    CheckCircleIcon,
    PlusIcon
} from 'lucide-react-native';
import { Animated } from 'react-native';
import locationService from '../services/locationService';
import vehicleService from '../services/vehicleService';
import { geocodeAddress } from '../utils/geocoding';
import MapView, { Marker, PROVIDER_GOOGLE } from '../components/Maps';
import { midnightMapStyle } from '../constants/mapStyle';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01; // Zoom level
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// --- Step Components ---

const Step1Location = ({ region, onRegionChangeComplete, mapRef, handleUseCurrentLocation, isGeocoding, locationAddress }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <Heading size="xl" color="$textLight" mb="$2">Where?</Heading>
            <Text color="$textDim" mb="$4">Drag the map to pin the service location.</Text>

            <Box flex={1} borderRadius="$xl" overflow="hidden" borderWidth={1} borderColor="$secondary900" mb="$4" height={400}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    customMapStyle={midnightMapStyle}
                    region={region}
                    onRegionChangeComplete={onRegionChangeComplete}
                >
                    {/* Fixed marker in center is simulated by UI overlay usually, but we can use a Marker that follows region for simplicity or just a center view */}
                </MapView>

                {/* Center Marker Overlay */}
                <Box position="absolute" top="50%" left="50%" marginTop={-24} marginLeft={-24} pointerEvents="none">
                    <Icon as={MapPinIcon} size={48} color="$primary500" fill="rgba(0, 229, 255, 0.2)" />
                </Box>

                {/* Current Location Button */}
                <Pressable
                    onPress={handleUseCurrentLocation}
                    position="absolute"
                    bottom={20}
                    right={20}
                    bg="$backgroundCard"
                    p="$3"
                    rounded="$full"
                    hardShadow="2"
                >
                    <Icon as={NavigationIcon} size="md" color="$primary500" />
                </Pressable>
            </Box>

            <Box bg="$backgroundCard" p="$4" rounded="$xl" borderWidth={1} borderColor="$secondary900">
                <HStack space="md" alignItems="center">
                    <Icon as={MapPinIcon} color="$textDim" size="sm" />
                    <VStack flex={1}>
                        <Text color="$textDim" size="xs" fontWeight="bold">SELECTED ADDRESS</Text>
                        <Text color="$textLight" numberOfLines={2}>
                            {isGeocoding ? 'Locating...' : (locationAddress || 'Select a location')}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        </Animated.View>
    );
};

const Step2Vehicle = ({ loadingVehicles, vehicles, selectedVehicle, setSelectedVehicle, navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Heading size="xl" color="$textLight" mb="$2">Which Car?</Heading>
            <Text color="$textDim" mb="$6">Select the vehicle to be serviced.</Text>

            {loadingVehicles ? (
                <Center py="$10"><Spinner size="large" color="$primary500" /></Center>
            ) : (
                <VStack space="md">
                    {vehicles.map((v) => (
                        <Pressable key={v.id} onPress={() => setSelectedVehicle(v)}>
                            <Box
                                bg={selectedVehicle?.id === v.id ? "$primary900" : "$backgroundCard"}
                                p="$4"
                                rounded="$xl"
                                borderWidth={1}
                                borderColor={selectedVehicle?.id === v.id ? "$primary500" : "$secondary900"}
                            >
                                <HStack space="md" alignItems="center">
                                    <Box bg="$secondary900" p="$3" rounded="$full">
                                        <Icon as={CarIcon} size="lg" color={selectedVehicle?.id === v.id ? "$primary500" : "$textDim"} />
                                    </Box>
                                    <VStack flex={1}>
                                        <Heading size="md" color="$textLight">{v.make} {v.model}</Heading>
                                        <Text color="$textDim" size="sm">{v.color} • {v.license_plate}</Text>
                                    </VStack>
                                    {selectedVehicle?.id === v.id && (
                                        <Icon as={CheckCircleIcon} color="$primary500" />
                                    )}
                                </HStack>
                            </Box>
                        </Pressable>
                    ))}

                    <Pressable onPress={() => navigation.navigate('AddVehicle')}>
                        <Box
                            p="$4"
                            rounded="$xl"
                            borderWidth={1}
                            borderColor="$secondary800"
                            borderStyle="dashed"
                            alignItems="center"
                            justifyContent="center"
                            bg="transparent"
                        >
                            <HStack space="xs" alignItems="center">
                                <Icon as={PlusIcon} color="$textDim" />
                                <Text color="$textDim">Add New Vehicle</Text>
                            </HStack>
                        </Box>
                    </Pressable>
                </VStack>
            )}
        </Animated.View>
    );
};

const Step3Schedule = ({ selectedDate, setSelectedDate, selectedTime, setSelectedTime }) => {
    // Generate next 7 days
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push({
            date: d,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            fullDate: d.toISOString().split('T')[0],
        });
    }
    const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Heading size="xl" color="$textLight" mb="$2">When?</Heading>
            <Text color="$textDim" mb="$6">Choose a date and time.</Text>

            <Box mb="$6">
                <Heading size="sm" color="$textLight" mb="$3">Select Date</Heading>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="sm">
                        {days.map((day, index) => (
                            <Pressable key={index} onPress={() => setSelectedDate(day)}>
                                <Box
                                    bg={selectedDate?.fullDate === day.fullDate ? "$primary500" : "$backgroundCard"}
                                    p="$3"
                                    rounded="$lg"
                                    borderWidth={1}
                                    borderColor={selectedDate?.fullDate === day.fullDate ? "$primary500" : "$secondary900"}
                                    alignItems="center"
                                    minWidth={70}
                                >
                                    <Text color={selectedDate?.fullDate === day.fullDate ? "$white" : "$textDim"} size="xs" mb="$1">{day.month}</Text>
                                    <Text color={selectedDate?.fullDate === day.fullDate ? "$white" : "$textLight"} size="2xl" fontWeight="bold" mb="$1">{day.dayNumber}</Text>
                                    <Text color={selectedDate?.fullDate === day.fullDate ? "$white" : "$textDim"} size="xs">{day.dayName}</Text>
                                </Box>
                            </Pressable>
                        ))}
                    </HStack>
                </ScrollView>
            </Box>

            <Box mb="$6">
                <Heading size="sm" color="$textLight" mb="$3">Select Time</Heading>
                <HStack flexWrap="wrap" space="sm" style={{ gap: 8 }}>
                    {times.map((time, index) => (
                        <Pressable key={index} onPress={() => setSelectedTime(time)} style={{ width: '30%' }}>
                            <Box
                                bg={selectedTime === time ? "rgba(0, 229, 255, 0.1)" : "$backgroundCard"}
                                py="$3"
                                rounded="$md"
                                borderWidth={1}
                                borderColor={selectedTime === time ? "$primary500" : "$secondary900"}
                                alignItems="center"
                            >
                                <Text color={selectedTime === time ? "$primary500" : "$textLight"} fontWeight={selectedTime === time ? "bold" : "normal"} size="sm">{time}</Text>
                            </Box>
                        </Pressable>
                    ))}
                </HStack>
            </Box>
        </Animated.View>
    );
};

const Step4Review = ({ service, selectedVehicle, locationAddress, selectedDate, selectedTime }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Heading size="xl" color="$textLight" mb="$2">Review</Heading>
            <Text color="$textDim" mb="$6">Confirm your booking details.</Text>

            <VStack space="md">
                <Box bg="$backgroundCard" p="$4" rounded="$xl" borderWidth={1} borderColor="$secondary900">
                    <Heading size="sm" color="$textDim" mb="$2">SERVICE</Heading>
                    <HStack justifyContent="space-between">
                        <Text color="$textLight" fontWeight="bold" size="lg">{service.name}</Text>
                        <Text color="$primary500" fontWeight="bold" size="lg">${service.price}</Text>
                    </HStack>
                    <Text color="$textDim" size="sm">{service.duration_minutes} mins</Text>
                </Box>

                <Box bg="$backgroundCard" p="$4" rounded="$xl" borderWidth={1} borderColor="$secondary900">
                    <Heading size="sm" color="$textDim" mb="$2">VEHICLE</Heading>
                    <HStack space="md" alignItems="center">
                        <Icon as={CarIcon} color="$primary500" />
                        <VStack>
                            <Text color="$textLight" fontWeight="bold">{selectedVehicle?.make} {selectedVehicle?.model}</Text>
                            <Text color="$textDim" size="sm">{selectedVehicle?.license_plate}</Text>
                        </VStack>
                    </HStack>
                </Box>

                <Box bg="$backgroundCard" p="$4" rounded="$xl" borderWidth={1} borderColor="$secondary900">
                    <Heading size="sm" color="$textDim" mb="$2">LOCATION</Heading>
                    <HStack space="md" alignItems="center">
                        <Icon as={MapPinIcon} color="$primary500" />
                        <Text color="$textLight" flex={1}>{locationAddress}</Text>
                    </HStack>
                </Box>

                <Box bg="$backgroundCard" p="$4" rounded="$xl" borderWidth={1} borderColor="$secondary900">
                    <Heading size="sm" color="$textDim" mb="$2">TIME</Heading>
                    <HStack space="md" alignItems="center">
                        <Icon as={CalendarIcon} color="$primary500" />
                        <Text color="$textLight">
                            {selectedDate?.dayName}, {selectedDate?.month} {selectedDate?.dayNumber} at {selectedTime}
                        </Text>
                    </HStack>
                </Box>
            </VStack>
        </Animated.View>
    );
};

const BookingScreen = ({ route, navigation }) => {
    const { service, detailerId } = route.params;

    // State
    const [step, setStep] = useState(1);
    const [locationAddress, setLocationAddress] = useState('');
    const [locationCoordinates, setLocationCoordinates] = useState(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Map State
    const mapRef = useRef(null);
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    // Fetch vehicles when entering Step 2 or screen focus
    const fetchVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const data = await vehicleService.getMyVehicles();
            setVehicles(data);
            // Auto-select if only one vehicle exists and none selected
            if (data.length === 1 && !selectedVehicle) {
                setSelectedVehicle(data[0]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load vehicles');
        } finally {
            setLoadingVehicles(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
        }, [])
    );

    // Initial Location
    useEffect(() => {
        (async () => {
            const location = await locationService.getCurrentLocation();
            if (location) {
                const newRegion = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                };
                setRegion(newRegion);
                setLocationCoordinates(location);
                // Reverse geocode initial location
                reverseGeocode(location.latitude, location.longitude);
            }
        })();
    }, []);

    const reverseGeocode = async (lat, lon) => {
        setIsGeocoding(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
                { headers: { 'User-Agent': 'CarDetailingApp/1.0' } }
            );
            const data = await response.json();
            if (data && data.display_name) {
                setLocationAddress(data.display_name);
            }
        } catch (error) {
            console.error('Reverse geocode error', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    // --- Handlers ---

    const handleUseCurrentLocation = async () => {
        setIsGeocoding(true);
        try {
            const location = await locationService.getCurrentLocation();
            if (location) {
                const newRegion = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                };
                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);
                setLocationCoordinates(location);
                reverseGeocode(location.latitude, location.longitude);
            } else {
                Alert.alert('Error', 'Could not get current location');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to get location');
        } finally {
            setIsGeocoding(false);
        }
    };

    const onRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
        setLocationCoordinates({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
        });
        // Debounce or just call reverse geocode
        reverseGeocode(newRegion.latitude, newRegion.longitude);
    };

    const handleNext = async () => {
        if (step === 1) {
            if (!locationCoordinates) {
                Alert.alert('Required', 'Please select a location on the map.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!selectedVehicle) {
                Alert.alert('Required', 'Please select a vehicle.');
                return;
            }
            setStep(3);
        } else if (step === 3) {
            if (!selectedDate || !selectedTime) {
                Alert.alert('Required', 'Please select a date and time.');
                return;
            }
            setStep(4);
        } else if (step === 4) {
            // Navigate to Payment
            navigation.navigate('Payment', {
                service,
                detailerId,
                date: selectedDate.fullDate,
                time: selectedTime,
                locationAddress: locationAddress.trim(),
                locationCoordinates,
                vehicle: selectedVehicle
            });
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    // --- Render Steps ---

    const renderProgressBar = () => (
        <HStack space="xs" mb="$6">
            {[1, 2, 3, 4].map((s) => (
                <Box
                    key={s}
                    flex={1}
                    h="$1"
                    bg={s <= step ? "$primary500" : "$secondary800"}
                    rounded="$full"
                />
            ))}
        </HStack>
    );

    return (
        <Box flex={1} bg="$backgroundDark">
            {/* Header */}
            <Box pt="$4" px="$5" pb="$2">
                {renderProgressBar()}
            </Box>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                {step === 1 && (
                    <Step1Location
                        region={region}
                        onRegionChangeComplete={onRegionChangeComplete}
                        mapRef={mapRef}
                        handleUseCurrentLocation={handleUseCurrentLocation}
                        isGeocoding={isGeocoding}
                        locationAddress={locationAddress}
                    />
                )}
                {step === 2 && (
                    <Step2Vehicle
                        loadingVehicles={loadingVehicles}
                        vehicles={vehicles}
                        selectedVehicle={selectedVehicle}
                        setSelectedVehicle={setSelectedVehicle}
                        navigation={navigation}
                    />
                )}
                {step === 3 && (
                    <Step3Schedule
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                    />
                )}
                {step === 4 && (
                    <Step4Review
                        service={service}
                        selectedVehicle={selectedVehicle}
                        locationAddress={locationAddress}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                    />
                )}
            </ScrollView>

            {/* Footer */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="$backgroundCard"
                p="$5"
                borderTopWidth={1}
                borderColor="$secondary900"
                safeAreaBottom
            >
                <HStack space="md">
                    <Button
                        flex={1}
                        variant="outline"
                        action="secondary"
                        onPress={handleBack}
                        borderColor="$secondary700"
                    >
                        <ButtonText color="$textDim">Back</ButtonText>
                    </Button>
                    <Button
                        flex={2}
                        action="primary"
                        onPress={handleNext}
                        bg="$primary500"
                        isDisabled={isGeocoding}
                    >
                        {isGeocoding ? (
                            <ButtonSpinner color="$white" />
                        ) : (
                            <ButtonText fontWeight="bold">
                                {step === 4 ? 'Confirm & Pay' : 'Next'}
                            </ButtonText>
                        )}
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default BookingScreen;
