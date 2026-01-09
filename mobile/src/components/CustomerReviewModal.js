import React, { useState } from 'react';
import { Modal } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    Textarea,
    TextareaInput,
    Button,
    ButtonText,
    ButtonSpinner,
    Center
} from '@gluestack-ui/themed';
import StarRating from './StarRating';

const CustomerReviewModal = ({ visible, onClose, onSubmit, booking }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            // Alert.alert('Error', 'Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({ rating, comment });
            setRating(0);
            setComment('');
            onClose();
        } catch (error) {
            console.error('Error submitting customer review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <Box flex={1} bg="rgba(0, 0, 0, 0.7)" justifyContent="flex-end">
                <Box
                    bg="$backgroundDark"
                    borderTopLeftRadius="$xl"
                    borderTopRightRadius="$xl"
                    p="$6"
                    maxHeight="85%"
                >
                    <VStack space="lg">
                        <Heading size="xl" color="$textLight">Rate Customer</Heading>

                        {booking && (
                            <Box bg="$backgroundCard" p="$4" rounded="$md">
                                <Text color="$textDim" size="sm">Service: {booking.service_name}</Text>
                                <Text color="$textDim" size="sm">Customer: {booking.customer_email}</Text>
                            </Box>
                        )}

                        {/* Star Rating */}
                        <VStack space="sm">
                            <Text color="$textLight" fontWeight="bold">Rating *</Text>
                            <Center py="$2">
                                <StarRating
                                    rating={rating}
                                    onRatingChange={setRating}
                                    interactive={true}
                                    size="xl"
                                />
                                <Text color="$textDim" size="sm" mt="$2">
                                    {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Tap to rate'}
                                </Text>
                            </Center>
                        </VStack>

                        {/* Comment */}
                        <VStack space="sm">
                            <Text color="$textLight" fontWeight="bold">Comment (Optional)</Text>
                            <Textarea size="md" borderColor="$secondary900" $focus-borderColor="$primary500" h={120}>
                                <TextareaInput
                                    placeholder="Share your experience with this customer..."
                                    placeholderTextColor="$textDim"
                                    color="$textLight"
                                    value={comment}
                                    onChangeText={setComment}
                                />
                            </Textarea>
                        </VStack>

                        {/* Buttons */}
                        <HStack space="md" mt="$4">
                            <Button
                                flex={1}
                                variant="outline"
                                action="secondary"
                                onPress={handleClose}
                                isDisabled={submitting}
                                borderColor="$secondary800"
                            >
                                <ButtonText color="$textDim">Cancel</ButtonText>
                            </Button>
                            <Button
                                flex={1}
                                variant="solid"
                                action="primary"
                                onPress={handleSubmit}
                                isDisabled={submitting || rating === 0}
                                bg="$primary500"
                            >
                                {submitting ? <ButtonSpinner color="$white" /> : <ButtonText fontWeight="bold">Submit Review</ButtonText>}
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
};

export default CustomerReviewModal;
