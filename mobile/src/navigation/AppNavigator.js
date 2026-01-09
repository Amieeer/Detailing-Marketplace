import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Center, Spinner } from '@gluestack-ui/themed';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailerProfileScreen from '../screens/DetailerProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';

import DetailerDashboardScreen from '../screens/DetailerDashboardScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import AddEditServiceScreen from '../screens/AddEditServiceScreen';
import ManageBookingsScreen from '../screens/ManageBookingsScreen';
import JobExecutionScreen from '../screens/JobExecutionScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import VehicleListScreen from '../screens/VehicleListScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';

import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import StripeOnboardingScreen from '../screens/StripeOnboardingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, token, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <Center flex={1} bg="$backgroundDark">
                <Spinner size="large" color="$primary500" />
            </Center>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerStyle: { backgroundColor: '#121212' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}>
                {token ? (
                    // Authenticated Stack
                    <>
                        {user?.role === 'detailer' ? (
                            <Stack.Screen name="DetailerDashboard" component={DetailerDashboardScreen} options={{ headerShown: false }} />
                        ) : (
                            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                        )}

                        {/* Common Authenticated Screens */}
                        <Stack.Screen name="DetailerProfile" component={DetailerProfileScreen} options={{ title: 'Detailer Profile' }} />
                        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Select Date' }} />
                        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
                        <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
                        <Stack.Screen name="VehicleList" component={VehicleListScreen} options={{ title: 'My Garage' }} />
                        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ title: 'Add Vehicle' }} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />

                        {/* Chat Screens */}
                        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
                        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />

                        {/* Detailer Specific Screens */}
                        <Stack.Screen name="ManageServices" component={ManageServicesScreen} options={{ title: 'My Services' }} />
                        <Stack.Screen name="AddEditService" component={AddEditServiceScreen} options={{ title: 'Service Details' }} />
                        <Stack.Screen name="ManageBookings" component={ManageBookingsScreen} options={{ title: 'Manage Bookings' }} />
                        <Stack.Screen name="JobExecution" component={JobExecutionScreen} options={{ title: 'Job Details' }} />
                        <Stack.Screen name="StripeOnboarding" component={StripeOnboardingScreen} options={{ title: 'Setup Payouts' }} />
                    </>
                ) : (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
