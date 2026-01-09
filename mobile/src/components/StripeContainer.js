import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const StripeContainer = ({ children }) => {
    return (
        <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51SWzP8EOtzKsyTUzy2ECMnApHhbw7iwEl0Nyx8U0YOHTPb0YVm3A1a3kWKh2mu32TZg0K11q31E31OCvqFKdYVk900qJkn4uXR"}>
            {children}
        </StripeProvider>
    );
};
