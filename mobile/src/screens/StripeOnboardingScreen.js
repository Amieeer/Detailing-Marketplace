import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
    ButtonSpinner,
    Icon,
    Center,
    Image
} from '@gluestack-ui/themed';
import { WalletIcon, CheckCircleIcon } from 'lucide-react-native';
import api from '../services/api';

const StripeOnboardingScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const handleConnectStripe = async () => {
        setLoading(true);
        try {
            // 1. Create or get Stripe Account
            const accountRes = await api.post('/payments/create-account');
            const { accountId } = accountRes.data;

            // 2. Create Account Link
            const linkRes = await api.post('/payments/create-account-link', { accountId });
            const { url } = linkRes.data;

            // 3. Open in Browser
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open this URL');
            }
        } catch (error) {
            console.error('Error connecting Stripe:', error);
            const message = error.response?.data?.message || error.message || 'Failed to start Stripe onboarding';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const checkAccountStatus = React.useCallback(async () => {
        try {
            setLoading(true);
            // Re-fetch profile logic here or call a specific status endpoint
            // For now, let's just create-account again which returns existing ID if exists
            // Ideally we should have a get-status endpoint. 
            await api.post('/payments/create-account');
            // If we get here, it means account is connected (based on controller logic)
            Alert.alert('Success', 'Payout account connected successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Check status error:', error);
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    React.useEffect(() => {
        const handleDeepLink = async (event) => {
            const { url } = event;
            if (url && url.includes('stripe-redirect')) {
                // Parse status from URL or just re-check account status
                // Security Best Practice: Don't trust the URL status blindly. 
                // Currently we just use it as a trigger to re-fetch profile.
                checkAccountStatus();
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Check if app was opened via deep link
        Linking.getInitialURL().then((url) => {
            if (url && url.includes('stripe-redirect')) {
                checkAccountStatus();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [checkAccountStatus]);

    return (
        <Box flex={1} bg="$backgroundDark" p="$5" justifyContent="center">
            <Center>
                <Box bg="$secondary900" p="$6" rounded="$full" mb="$6">
                    <Icon as={WalletIcon} size="4xl" color="$primary500" />
                </Box>

                <Heading size="2xl" color="$textLight" textAlign="center" mb="$2">
                    Get Paid with Stripe
                </Heading>

                <Text color="$textDim" textAlign="center" mb="$8" px="$4">
                    To receive payments for your services, you need to set up a secure payout account with Stripe. It only takes a few minutes.
                </Text>

                <VStack space="md" width="100%">
                    <Button
                        size="xl"
                        action="primary"
                        onPress={handleConnectStripe}
                        isDisabled={loading}
                        bg="$primary500"
                        rounded="$full"
                    >
                        {loading ? (
                            <ButtonSpinner color="$white" />
                        ) : (
                            <ButtonText fontWeight="bold">Setup Payouts</ButtonText>
                        )}
                    </Button>

                    <Button
                        variant="link"
                        onPress={() => navigation.goBack()}
                        mt="$2"
                    >
                        <ButtonText color="$textDim">Do this later</ButtonText>
                    </Button>
                </VStack>
            </Center>
        </Box>
    );
};

export default StripeOnboardingScreen;
