import React, { useState, useEffect } from 'react';
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
    Switch,
    Pressable,
    Center
} from '@gluestack-ui/themed';
import StarRating from './StarRating';

const ReviewModal = ({ visible, onClose, onSubmit, existingReview = null }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            setRating(existingReview?.rating || 0);
            setComment(existingReview?.comment || '');
            setIsAnonymous(existingReview?.is_anonymous || false);
        }
    }, [visible, existingReview]);

    const handleSubmit = async () => {
        if (rating === 0) {
            // You might want to show a toast or alert here
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({ rating, comment, is_anonymous: isAnonymous });
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
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
                        <Heading size="xl" color="$textLight">
                            {existingReview ? 'Edit Review' : 'Write a Review'}
                        </Heading>

                        {/* Star Rating */}
                        <VStack space="sm">
                            <Text color="$textLight" fontWeight="bold">Rating *</Text>
                            <Center py="$2">
                                <StarRating
                                    rating={rating}
                                    onRatingChange={setRating}
                                    interactive={true}
                                    size="xl" // Gluestack size
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
                                    placeholder="Share your experience..."
                                    placeholderTextColor="$textDim"
                                    color="$textLight"
                                    value={comment}
                                    onChangeText={setComment}
                                />
                            </Textarea>
                        </VStack>

                        {/* Anonymous Toggle */}
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack flex={1} mr="$4">
                                <Text color="$textLight" fontWeight="bold">Post Anonymously</Text>
                                <Text color="$textDim" size="xs">Your name will be hidden from the review</Text>
                            </VStack>
                            <Switch
                                value={isAnonymous}
                                onValueChange={setIsAnonymous}
                                trackColor={{ false: '$secondary800', true: '$primary500' }}
                                thumbColor={isAnonymous ? '$white' : '$textDim'}
                            />
                        </HStack>

                        {/* Buttons */}
                        <HStack space="md" mt="$4">
                            <Button
                                flex={1}
                                variant="outline"
                                action="secondary"
                                onPress={onClose}
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

export default ReviewModal;
