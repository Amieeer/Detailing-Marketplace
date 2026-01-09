import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Text, HStack, Icon, Spinner } from '@gluestack-ui/themed';
import { CloudRainIcon, SunIcon, CloudIcon, CloudLightningIcon } from 'lucide-react-native';
import * as Location from 'expo-location';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Using Open-Meteo API (Free, no key)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation&temperature_unit=fahrenheit`
            );
            const data = await response.json();
            setWeather(data.current);
        } catch (error) {
            console.error('Weather fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (code) => {
        if (code <= 3) return SunIcon; // Clear/Cloudy
        if (code <= 67) return CloudRainIcon; // Rain
        if (code <= 99) return CloudLightningIcon; // Storm
        return CloudIcon;
    };

    const getWeatherLabel = (code) => {
        if (code <= 3) return 'Clear';
        if (code <= 67) return 'Rainy';
        if (code <= 99) return 'Stormy';
        return 'Cloudy';
    };

    if (loading) return <Spinner size="small" color="$white" />;
    if (!weather) return null;

    const IconComponent = getWeatherIcon(weather.weather_code);

    return (
        <Box style={styles.container}>
            <HStack space="sm" alignItems="center" bg="$backgroundDark" px="$3" py="$1.5" rounded="$full" opacity={0.8}>
                <Icon as={IconComponent} size="sm" color="$yellow400" />
                <Text color="$white" size="sm" fontWeight="bold">
                    {Math.round(weather.temperature_2m)}°F
                </Text>
                <Text color="$textDim" size="xs">
                    {getWeatherLabel(weather.weather_code)}
                </Text>
            </HStack>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        // positioned absolutely in header usually, or inline
    },
});

export default WeatherWidget;
