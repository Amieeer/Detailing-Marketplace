export const useStripe = () => {
    return {
        initPaymentSheet: async () => ({ error: null }),
        presentPaymentSheet: async () => {
            alert("Stripe payments are not yet supported on web.");
            return { error: { message: "Not supported on web" } };
        },
    };
};
