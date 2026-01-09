import { useStripe as useStripeNative } from '@stripe/stripe-react-native';

export const useStripe = () => {
    return useStripeNative();
};
